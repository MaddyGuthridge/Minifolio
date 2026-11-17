import { validateTokenFromRequest } from '#lib/server/auth/tokens.ts';
import { authIsSetUp } from '#lib/server/data/dataDir.ts';
import { getLocalConfig, setLocalConfig } from '#lib/server/data/localConfig.ts';
import { unixTime } from '#lib/util.ts';
import { error, json } from '@sveltejs/kit';

export async function POST({ request, cookies }: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');

  const local = await getLocalConfig();

  if (!local.auth) {
    return error(403, 'Authentication was disabled');
  }

  const uid = await validateTokenFromRequest({ request, cookies });

  local.auth[uid].sessions.notBefore = unixTime();

  await setLocalConfig(local);

  return json({}, { status: 200 });
}
