import { object, string, validate } from 'superstruct';
import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { commit, getRepoStatus } from '$lib/server/git';
import { dataIsSetUp } from '$lib/server/data/dataDir.js';

export async function POST({ request, cookies }: import('./$types.js').RequestEvent) {
  if (await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  const [err, options] = validate(await request.json(), object({ message: string() }));

  if (err) {
    error(400, `${err}`);
  }

  await commit(options.message);

  return json(await getRepoStatus(), { status: 200 });
}
