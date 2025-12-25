import { error, json } from '@sveltejs/kit';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import z from 'zod';
import { setupData } from '$lib/server/data/setup';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';

const FirstRunDataOptions = z.strictObject({
  repoUrl: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
});

export type FirstRunDataOptions = z.infer<typeof FirstRunDataOptions>;

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (await dataIsSetUp()) {
    error(403, 'Data directory is already set up');
  }
  await validateTokenFromRequest({ request, cookies });

  const options = await FirstRunDataOptions.parseAsync(await request.json())
    .catch(e => error(400, e));

  if (options.branch && !options.repoUrl) {
    error(400, 'Branch must not be given if repo URL is not provided');
  }

  const firstTime = await setupData(
    options.repoUrl ?? undefined,
    options.branch ?? undefined,
  );

  return json({ firstTime }, { status: 200 });
}
