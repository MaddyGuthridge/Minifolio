import { error, json } from '@sveltejs/kit';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { authSetup } from '$lib/server/auth/setup';
import { object, string, type Infer } from 'superstruct';
import { applyStruct } from '$lib/server/util';
import validate from '$lib/validate';

const FirstRunAuthOptionsStruct = object({
  username: string(),
  password: string(),
});

export type FirstRunAuthOptions = Infer<typeof FirstRunAuthOptionsStruct>;

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  const options = applyStruct(await request.json(), FirstRunAuthOptionsStruct);

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
