import itemId from '$lib/itemId';
import { getConfig } from '$lib/server/data/config';
import { dataDirUsesGit } from '$lib/server/data/dataDir';
import { getItemData } from '$lib/server/data/item';
import { getLocalConfig } from '$lib/server/data/localConfig';
import { getRepoStatus } from '$lib/server/git';
import { getPrivateKeyPath, getPublicKey } from '$lib/server/keys';
import { redirectOnInvalidToken, redirectForSetup } from '$lib/server/redirects';

export async function load(req: import('./$types').RequestEvent) {
  await redirectForSetup();
  const portfolio = await getItemData(itemId.ROOT);
  await redirectOnInvalidToken(req, '/admin/login');
  const repo = await dataDirUsesGit() ? await getRepoStatus() : null;
  const config = await getConfig();
  const localConfig = await getLocalConfig();
  return {
    portfolio,
    repo,
    config,
    gitConfig: localConfig.gitConfig,
    keys: {
      publicKey: await getPublicKey(),
      keyPath: await getPrivateKeyPath(),
    },
  };
}
