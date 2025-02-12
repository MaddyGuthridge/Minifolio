// Stop trying to make fetch happen! It's not going to happen!
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataDirUsesGit, dataIsSetUp } from '$lib/server/data/dataDir';
import { fetch, getRepoStatus } from '$lib/server/git';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  await fetch();
  return json(await getRepoStatus(), { status: 200 });
}
