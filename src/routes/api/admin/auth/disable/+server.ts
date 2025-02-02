import { validateCredentials } from '$lib/server/auth/passwords';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import { error, json } from '@sveltejs/kit';

// TODO: Remove this when setting up user management
export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');
  const uid = await validateTokenFromRequest({ request, cookies });

  const local = await getLocalConfig();

  if (!local.auth) {
    throw Error('Unreachable');
  }

  const { username, password } = await request.json();

  await validateCredentials(username, password, 403);

  // Delete this user
  delete local.auth[uid];
  await setLocalConfig(local);

  return json({}, { status: 200 });
}
