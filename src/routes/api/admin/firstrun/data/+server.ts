import { error, json } from '@sveltejs/kit';
import { dataIsSetUp } from '#lib/server/data/dataDir.ts';
import z from 'zod';
import { setupData } from '#lib/server/data/setup.ts';
import { validateTokenFromRequest } from '#lib/server/auth/tokens.ts';
import validate from '#lib/validate.ts';

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

  const options = validate.parse(FirstRunDataOptions, await request.json());

  if (options.branch && !options.repoUrl) {
    error(400, 'Branch must not be given if repo URL is not provided');
  }

  const firstTime = await setupData(
    options.repoUrl ?? undefined,
    options.branch ?? undefined,
  );

  return json({ firstTime }, { status: 200 });
}
