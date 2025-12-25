import { error, json } from '@sveltejs/kit';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { authSetup } from '$lib/server/auth/setup';
import z from 'zod';
import validate from '$lib/validate';

const FirstRunAuthOptions = z.strictObject({
  username: z.string(),
  password: z.string(),
});

export type FirstRunAuthOptions = z.infer<typeof FirstRunAuthOptions>;

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  const options = await FirstRunAuthOptions.parseAsync(await request.json())
    .catch(e => error(400, e));

  if (await authIsSetUp()) {
    error(403);
  }

  // Validate username and password
  validate.id('username', options.username);
  validate.password(options.password);

  // Now set up auth
  const token = await authSetup(options.username, options.password, cookies);

  return json({ token }, { status: 200 });
}
