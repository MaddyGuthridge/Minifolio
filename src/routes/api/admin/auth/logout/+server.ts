import { getTokenFromRequest, revokeSession } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { error, json } from '@sveltejs/kit';

export async function POST(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');

  const token = getTokenFromRequest(req);

  if (!token) {
    error(401, 'A token is required to access this endpoint');
  }

  await revokeSession(token)
    .catch(e => error(401, `${e}`));

  return json({}, { status: 200 });
}
