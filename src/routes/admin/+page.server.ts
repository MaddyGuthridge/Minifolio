import itemId from '#lib/itemId.ts';
import { getConfig } from '#lib/server/data/config.ts';
import { dataDirUsesGit } from '#lib/server/data/dataDir.ts';
import { getItemData } from '#lib/server/data/item/index.ts';
import { getLocalConfig } from '#lib/server/data/localConfig.ts';
import { getRepoStatus } from '#lib/server/git.ts';
import { getPrivateKeyPath, getPublicKey } from '#lib/server/keys.ts';
import { redirectOnInvalidToken, redirectForSetup } from '#lib/server/redirects.ts';

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
