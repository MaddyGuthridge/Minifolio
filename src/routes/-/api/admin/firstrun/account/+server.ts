import { error, json } from '@sveltejs/kit';
import { authIsSetUp } from '#lib/server/data/dataDir.ts';
import { authSetup } from '#lib/server/auth/setup.ts';
import z from 'zod';
import validate from '#lib/validate.ts';

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
