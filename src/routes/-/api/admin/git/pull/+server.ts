import { validateTokenFromRequest } from '#lib/server/auth/tokens.ts';
import { dataDirUsesGit, dataIsSetUp } from '#lib/server/data/dataDir.ts';
import { getRepoStatus, pull } from '#lib/server/git.ts';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  await pull();
  return json(await getRepoStatus(), { status: 200 });
}
