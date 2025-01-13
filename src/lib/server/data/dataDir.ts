import path from 'path';
import simpleGit, { CheckRepoActions } from 'simple-git';
import { fileExists } from '../util';

/** Returns the path to the data repository */
export function getDataDir(): string {
  const repoPath = process.env.DATA_REPO_PATH;
  if (!repoPath) {
    throw new Error('DATA_REPO_PATH environment variable is not set');
  }
  return repoPath;
}

/**
 * Returns the path to the private data directory, which contains data such as
 * `config.local.json` and the server's SSH keys.
 */
export function getPrivateDataDir(): string {
  const privateDataPath = process.env.PRIVATE_DATA_PATH;
  if (!privateDataPath) {
    throw new Error('PRIVATE_DATA_PATH environment variable is not set');
  }
  return privateDataPath;
}

/**
 * Returns whether the data directory contains data that can conceivably
 * be used by Minifolio.
 *
 * This should be used when setting up a git repo to ensure that its data is
 * valid enough to be used by us.
 *
 * Currently, this checks for the existence of a config.json, but in the future
 * I may force it to check more thoroughly for data validity.
 */
export async function dataIsSetUp(): Promise<boolean> {
  const repoPath = getDataDir();
  return await fileExists(path.join(repoPath, 'config.json'));
}

/** Returns whether the data directory is a git repo */
export async function dataDirUsesGit(): Promise<boolean> {
  const repoPath = getDataDir();
  const repo = simpleGit(repoPath);
  return repo.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);
}

/**
 * Returns whether the private data has been initialized.
 *
 * This checks for the existence of a config.local.json.
 */
export async function authIsSetUp(): Promise<boolean> {
  const repoPath = getPrivateDataDir();
  return await fileExists(path.join(repoPath, 'config.local.json'));
}
