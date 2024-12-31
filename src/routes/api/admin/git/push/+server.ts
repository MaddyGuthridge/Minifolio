import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getRepoStatus, push } from '$lib/server/git.js';
import { dataIsSetUp } from '$lib/server/data/dataDir.js';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types.js').RequestEvent) {
  if (await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  await push();
  return json(await getRepoStatus(), { status: 200 });
}
