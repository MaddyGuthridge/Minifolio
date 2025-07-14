import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig } from '$lib/server/data/localConfig';
import { fileExists } from '$lib/server/util';
import { disableKey, getPublicKey, setKeyPath } from '$lib/server/keys';

/** Return the current public key */
export async function GET(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    error(400);
  }
  await validateTokenFromRequest(req);

  const keyPath = await getLocalConfig().then(c => c.keyPath);
  const publicKey = await getPublicKey();
  return json({
    publicKey,
    keyPath,
  }, { status: 200 });
}

/** Set the path to the key */
export async function POST(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    error(400);
  }
  await validateTokenFromRequest(req);

  const { keyPath } = await req.request.json();

  // Ensure private and public key files exist
  if (!await fileExists(keyPath)) {
    error(400, 'Private key file must exist');
  }
  if (!await fileExists(keyPath + '.pub')) {
    error(400, 'Public key file must exist');
  }

  await setKeyPath(keyPath);

  return json({
    publicKey: await getPublicKey(),
    keyPath: await getLocalConfig().then(c => c.keyPath),
  }, { status: 200 });
}

/** Disable SSH key-based authentication */
export async function DELETE(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    error(400);
  }
  await validateTokenFromRequest(req);

  await disableKey();

  return json({}, { status: 200 });
}
