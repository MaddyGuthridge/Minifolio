import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getRepoStatus, push } from '$lib/server/git.js';
import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/index';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types.js').RequestEvent) {
  await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  await push();

  invalidatePortfolioGlobals();
  return json(await getRepoStatus(), { status: 200 });
}
