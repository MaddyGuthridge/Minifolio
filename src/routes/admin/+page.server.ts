import { getPortfolioGlobals } from '$lib/server';
import { redirectOnInvalidToken } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getRepoStatus } from '$lib/server/git';
import { getPrivateKeyPath, getPublicKey } from '$lib/server/keys';

export async function load(req: import('./$types').RequestEvent) {
  const globals = await getPortfolioGlobals();
  await redirectOnInvalidToken(req, '/admin/login');
  const repo = await dataDirUsesGit() ? await getRepoStatus() : null;
  return {
    globals,
    repo,
    keys: {
      publicKey: await getPublicKey(),
      keyPath: await getPrivateKeyPath(),
    }
  };
}
