import itemId from '$lib/itemId';
import { redirectOnInvalidToken } from '$lib/server/auth/tokens';
import { getConfig } from '$lib/server/data/config';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getItemData } from '$lib/server/data/item';
import { getRepoStatus } from '$lib/server/git';
import { getPrivateKeyPath, getPublicKey } from '$lib/server/keys';

export async function load(req: import('./$types').RequestEvent) {
  const portfolio = await getItemData(itemId.ROOT);
  await redirectOnInvalidToken(req, '/admin/login');
  const repo = await dataDirUsesGit() ? await getRepoStatus() : null;
  const config = await getConfig();
  return {
    portfolio,
    repo,
    config,
    keys: {
      publicKey: await getPublicKey(),
      keyPath: await getPrivateKeyPath(),
    }
  };
}
