import { redirect } from '@sveltejs/kit';
import { authIsSetUp, dataIsSetUp } from '$lib/server/data/dataDir';
import { redirectOnInvalidToken } from '$lib/server/auth/tokens';
import { getPrivateKeyPath, getPublicKey } from '$lib/server/keys.js';

export async function load(req: import('./$types.js').RequestEvent) {
  if (!await authIsSetUp()) {
    redirect(303, '/admin/firstrun/account');
  }
  if (await dataIsSetUp()) {
    redirect(303, '/');
  }
  await redirectOnInvalidToken(req, '/admin/login');
  return {
    publicKey: await getPublicKey(),
    keyPath: await getPrivateKeyPath(),
  };
}
