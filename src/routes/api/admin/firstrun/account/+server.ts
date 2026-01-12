import { error, json } from '@sveltejs/kit';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { authSetup } from '$lib/server/auth/setup';
import z from 'zod';
import validate from '$lib/validate';

const FirstRunAuthOptions = z.strictObject({
  username: validate.idComponent,
  password: validate.password,
});

export type FirstRunAuthOptions = z.infer<typeof FirstRunAuthOptions>;

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  const options = validate.parse(FirstRunAuthOptions, await request.json());

  if (await authIsSetUp()) {
    error(403);
  }

  // Now set up auth
  const token = await authSetup(options.username, options.password, cookies);

  return json({ token }, { status: 200 });
}
