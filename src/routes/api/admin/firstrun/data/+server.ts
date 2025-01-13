import { error, json } from '@sveltejs/kit';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { nullable, object, optional, string, type Infer } from 'superstruct';
import { applyStruct } from '$lib/server/util';
import { setupData } from '$lib/server/data/setup';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';

const FirstRunDataOptionsStruct = object({
  repoUrl: optional(nullable(string())),
  branch: optional(nullable(string())),
});

export type FirstRunDataOptions = Infer<typeof FirstRunDataOptionsStruct>;

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (await dataIsSetUp()) {
    error(403, 'Data directory is already set up');
  }
  await validateTokenFromRequest({ request, cookies });

  const options = applyStruct(await request.json(), FirstRunDataOptionsStruct);

  if (options.branch && !options.repoUrl) {
    error(400, 'Branch must not be given if repo URL is not provided');
  }

  const firstTime = await setupData(
    options.repoUrl ?? undefined,
    options.branch ?? undefined,
  );

  return json({ firstTime }, { status: 200 });
}
