import { error, json } from '@sveltejs/kit';
import { dataDirUsesGit, dataIsSetUp } from '$lib/server/data/dataDir';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { getRepoStatus } from '$lib/server/git';

export async function GET({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    return json({ repo: null }, { status: 200 });
  }

  return json({ repo: await getRepoStatus() }, { status: 200 });
}
