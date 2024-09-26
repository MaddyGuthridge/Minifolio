import { validateTokenFromRequest } from '$lib/server/auth.js';
import { dataDirUsesGit, getDataDir } from '$lib/server/data/dataDir.js';
import { getRepoStatus } from '$lib/server/git.js';
import { getPortfolioGlobals } from '$lib/server/index.js';
import { error, json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { object, string, validate } from 'superstruct';

export async function POST({ request, cookies }) {
  await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  if (await dataDirUsesGit()) {
    error(400, 'Data dir already contains a git repo');
  }

  const [err, options] = validate(await request.json(), object({ url: string() }));

  if (err) {
    error(400, `${err}`);
  }

  const git = simpleGit(getDataDir());

  // git init
  await git.init();
  await git.addRemote('origin', options.url);

  // Use git fetch to determine whether the repo is empty
  const fetchResult = await git.fetch().catch(e => error(400, `${e}`));
  if (fetchResult.branches.length) {
    error(400, 'Git repo is not empty');
  }

  return json(await getRepoStatus(), { status: 200 });
}