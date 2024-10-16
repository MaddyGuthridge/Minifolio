import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getRepoStatus, initRepo } from '$lib/server/git';
import { getPortfolioGlobals } from '$lib/server/index';
import { error, json } from '@sveltejs/kit';
import { object, string, validate } from 'superstruct';

export async function POST({ request, cookies }: import('./$types.js').RequestEvent) {
  await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  if (await dataDirUsesGit()) {
    error(400, 'Data dir already contains a git repo');
  }

  const [err, options] = validate(await request.json(), object({ url: string() }));

  if (err) {
    error(400, `${err}`);
  }

  await initRepo(options.url);

  return json(await getRepoStatus(), { status: 200 });
}
