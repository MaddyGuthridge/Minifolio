import { generateToken, getTokenFromRequest, revokeSession, validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { error, json } from '@sveltejs/kit';

export async function POST(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');

  const token = getTokenFromRequest(req);
  const uid = await validateTokenFromRequest(req);

  if (!token) {
    error(401, 'A token is required to access this endpoint');
  }

  // Revoke old session
  await revokeSession(token)
    .catch(e => error(401, `${e}`));

  // And generate a new session
  return json({ token: await generateToken(uid, req.cookies) }, { status: 200 });
}
