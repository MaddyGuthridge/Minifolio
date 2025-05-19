import { generateAuthSecret } from '$lib/server/auth/secret';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');
  await validateTokenFromRequest({ request, cookies });

  await generateAuthSecret();

  return json({}, { status: 200 });
}
