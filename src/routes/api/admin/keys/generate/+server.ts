import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig } from '$lib/server/data/localConfig';
import { generateKey } from '$lib/server/keys';

/** Generate an SSH key */
export async function POST(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    error(400);
  }
  await validateTokenFromRequest(req);

  const publicKey = await generateKey();

  return json({
    publicKey,
    keyPath: await getLocalConfig().then(c => c.keyPath),
  }, { status: 200 });
}
