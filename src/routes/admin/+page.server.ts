import { redirectOnInvalidToken } from '$lib/server/auth/tokens';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getItemData } from '$lib/server/data/item';
import { getRepoStatus } from '$lib/server/git';
import { getPrivateKeyPath, getPublicKey } from '$lib/server/keys';

export async function load(req: import('./$types').RequestEvent) {
  const portfolio = await getItemData('/');
  await redirectOnInvalidToken(req, '/admin/login');
  const repo = await dataDirUsesGit() ? await getRepoStatus() : null;
  return {
    portfolio,
    repo,
    keys: {
      publicKey: await getPublicKey(),
      keyPath: await getPrivateKeyPath(),
    }
  };
}
