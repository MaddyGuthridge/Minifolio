import z from 'zod';
import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '#lib/server/auth/tokens.ts';
import { dataDirUsesGit, dataIsSetUp } from '#lib/server/data/dataDir.ts';
import { commit, getRepoStatus } from '#lib/server/git.ts';
import validate from '#lib/validate.ts';

const CommitOptions = z.object({
  message: z.string(),
});

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest({ request, cookies });

  if (!await dataDirUsesGit()) {
    error(400, 'Data dir is not a git repo');
  }

  const options = validate.parse(CommitOptions, await request.json());

  await commit(options.message);

  return json(await getRepoStatus(), { status: 200 });
}
