import { isIpBanned, notifyFailedLogin } from '$lib/server/auth/fail2ban';
import { validateCredentials } from '$lib/server/auth/passwords';
import { generateToken } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getIpFromRequest } from '$lib/server/request';
import { error, json } from '@sveltejs/kit';


export async function POST(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) error(400, 'Auth is not set up yet');

  const ip = await getIpFromRequest(req);

  if (await isIpBanned(ip)) {
    error(403, 'IP address is banned');
  }

  const { username, password } = await req.request.json();

  let uid: string;
  try {
    uid = await validateCredentials(username, password);
  } catch (e) {
    await notifyFailedLogin(ip);
    throw e;
  }

  return json({ token: await generateToken(uid, req.cookies) }, { status: 200 });
}
