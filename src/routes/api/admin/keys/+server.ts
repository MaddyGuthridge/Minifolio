import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { serverIsSetUp } from '$lib/server/data/dataDir';
import { getPublicKey } from '$lib/server/keys.js';
import { json } from '@sveltejs/kit';

export async function GET(req) {
  // Auth needed when set up, but otherwise not
  if (await serverIsSetUp()) {
    await validateTokenFromRequest(req);
  }

  return json({ publicKey: await getPublicKey() }, { status: 200 });
}
