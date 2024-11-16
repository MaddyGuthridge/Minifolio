import { error } from '@sveltejs/kit';
import { dataIsSetUp, getDataDir } from './data/dataDir';
import simpleGit, { type FileStatusResult } from 'simple-git';
import fs from 'fs/promises';
import { rimraf } from 'rimraf';
import { spawn } from 'child-process-promise';
import { fileExists } from '.';
import path from 'path';
import { defaultKeysDirectory, getPrivateKeyPath } from './keys';

/** Path to the SSH known hosts file */
const knownHostsFile = () => path.join(defaultKeysDirectory(), 'known_hosts');

/**
 * Create a git client in the given directory.
 *
 * This configures `simpleGit` to use the configured SSH keys.
 */
export const gitClient = async (baseDir: string | undefined) => {
  let git = simpleGit(baseDir);
  if (await getPrivateKeyPath()) {
    git = git.env(
      'GIT_SSH_COMMAND',
      [
        'ssh',
        // Specify private key with -i (https://stackoverflow.com/a/29754018/6335363)
        '-i',
        await getPrivateKeyPath(),
        // Only use specified identity file
        '-o',
        'IdentitiesOnly=yes',
        // Specify known_hosts file with -o (https://stackoverflow.com/a/62725161/6335363)
        '-o',
        `UserKnownHostsFile=${knownHostsFile()}`,
      ].join(' '),
    );
  }
  return git;
}

/** Status information of a git repo */
export type RepoStatus = {
  /** The repo URL */
  url: string
  /** The current branch */
  branch: string | null
  /** The current commit hash */
  commit: string | null
  /** Whether the repository has any uncommitted changes */
  clean: boolean
  /** Number of commits ahead of origin */
  ahead: number
  /** Number of commits behind origin */
  behind: number
  /** Changes for files */
  changes: FileStatusResult[],
}

/** Returns whether the given URL requires SSH */
export function urlRequiresSsh(url: string): boolean {
  return (
    url.includes('@')
    && url.includes(':')
  );
}

/**
 * Run an ssh-keyscan command for the host at the given URL.
 *
 * Eg given URL "git@host.com:path/to/repo", we should extract:
 *                   ^^^^^^^^
 */
export async function runSshKeyscan(url: string) {
  // FIXME: This probably doesn't work in some cases
  const host = url.split('@', 2)[1].split(':', 1)[0];

  // mkdir -p /path/to/known/hosts
  await fs.mkdir(defaultKeysDirectory(), { recursive: true }).catch(() => { });

  // Check if ~/.ssh/known_hosts already has this host in it
  if (await fileExists(knownHostsFile())) {
    const hostsContent = await fs.readFile(knownHostsFile(), { encoding: 'utf-8' });
    for (const line of hostsContent.split(/\r?\n/)) {
      if (line.startsWith(`${host} `)) {
        // Host is already known
        return;
      }
    }
  }

  const process = await spawn('ssh-keyscan', [host], { capture: ['stdout'] });

  // console.log(process.stdout);
  // console.log(typeof process.stdout);

  // Now add to known hosts file
  await fs.appendFile(knownHostsFile(), process.stdout, { encoding: 'utf-8' });
}

/** Return status info for repo */
export async function getRepoStatus(): Promise<RepoStatus> {
  const git = await gitClient(getDataDir());
  const status = await git.status();

  // Workaround for issue with simple-git
  // https://github.com/steveukx/git-js/issues/1020
  const branch = status.current !== 'No' ? status.current : null;

  return {
    url: (await git.remote(['get-url', 'origin']) || '').trim(),
    branch,
    // If command fails, no commit has been made
    commit: await git.revparse(['--short', 'HEAD']).catch(() => null),
    clean: status.isClean(),
    ahead: status.ahead,
    behind: status.behind,
    // Need to map changed files to a new object or we get a JSON serialize
    // error
    changes: status.files.map(f => ({ ...f })),
  };
}

/** Set up the data dir given a git repo URL and branch name */
export async function setupGitRepo(repo: string, branch?: string | null) {
  // Check whether the data repo is set up
  if (await dataIsSetUp()) {
    error(403, 'Data repo is already set up');
  }

  const dir = getDataDir();

  // Set up branch options
  // FIXME: This may cause git to only track that branch on the remote, making
  // switching branches impossible.
  const options: Record<string, string> = branch ? { '--branch': branch } : {};

  try {
    await gitClient(undefined).then(git => git.clone(repo, dir, options));
  } catch (e: any) {
    console.log(e);
    error(400, `${e}`);
  }

  // If there are files in the repo, we should validate that it is a proper
  // portfolio data repo.
  // Ignore .git, since it is included in empty repos too.
  if ((await fs.readdir(getDataDir())).find(f => f !== '.git')) {
    if (!await dataIsSetUp()) {
      // Clean up and delete repo before giving error
      await rimraf(getDataDir());
      error(
        400,
        'The repo directory is non-empty, but does not contain a config.json file'
      );
    }
  } else {
    // No need for a .gitignore now, since private data is store separately
  }
}

/** Initialize a git repo with the given remote URL */
export async function initRepo(url: string) {
  const git = await gitClient(getDataDir());
  await git.init().addRemote('origin', url);

  // For SSH URLs, we may need to add the URL as a known host
  if (urlRequiresSsh(url)) {
    await runSshKeyscan(url);
  }

  // Use git fetch to determine whether the repo is empty
  const fetchResult = await git.fetch().catch(e => error(400, `${e}`));
  if (fetchResult.branches.length) {
    error(400, 'Git repo is not empty');
  }
}

/**
 * Perform a git commit with the given message.
 *
 * Currently, this runs `git add` on all files. Perhaps it can be expanded
 * later.
 */
export async function commit(message: string) {
  const git = await gitClient(getDataDir());

  const changes = await git.status();
  if (!changes.files.length) {
    error(400, 'No changes present');
  }

  // Add all changes
  await git.add('.');
  await git.commit(message);
}

/** Perform a `git pull` operation */
export async function pull() {
  const git = await gitClient(getDataDir());

  const { commit: prevCommit } = await getRepoStatus();

  // Merge divergent changes
  await git.pull(['--no-rebase']).catch(e => error(400, `${e}`));
  const status = await getRepoStatus();

  if (status.commit === prevCommit) {
    error(400, 'No changes to pull');
  }
}

/** Perform a `git push` operation */
export async function push() {
  const git = await gitClient(getDataDir());

  const { ahead } = await getRepoStatus();

  if (ahead === 0) {
    error(400, 'No changes to push');
  }

  await git.push().catch(e => error(400, `${e}`));
}
