import api, { type ApiClient } from '$endpoints';
import type { ConfigJson } from '$lib/server/data/config';
import { version } from '$app/environment';
import simpleGit from 'simple-git';
import { getDataDir } from '$lib/server/data/dataDir';
import type { ItemInfo } from '$lib/server/data/item';
import type { ItemId } from '$lib/server/data/itemId';

/** Set up the server, returning (amongst other things) an API client */
export async function setup(repoUrl?: string, branch?: string) {
  const username = 'admin';
  const password = 'abc123ABC!';
  const { token } = await api().admin.firstrun.account(username, password);
  await api(token).admin.firstrun.data(repoUrl, branch);
  return {
    api: api(token),
    token,
    username,
    password,
  };
}

/** Create custom config.json object */
export function makeConfig(options: Partial<ConfigJson> = {}): ConfigJson {
  const config: ConfigJson = {
    siteIcon: null,
    version,
  };
  return { ...config, ...options };
}

/** Create an item with the given ID */
export async function makeItem(api: ApiClient, id: ItemId, name = 'My item') {
  await api.item(id).info.post(name);
}

/** Creates custom item properties object */
export function makeItemInfo(options: Partial<ItemInfo> = {}): ItemInfo {
  const item: ItemInfo = {
    name: 'My item',
    shortName: null,
    description: 'Item description',
    icon: null,
    banner: null,
    color: '#aa00aa',
    sections: [],
    children: [],
    filters: [],
    seo: {
      description: 'View this item page in the portfolio',
      keywords: []
    },
  };

  return { ...item, ...options };
}

/** Rewind the data repo's git repo to an earlier commit */
export async function forceRewindDataRepoGit(api: ApiClient) {
  // A commit hash within MaddyGuthridge/portfolio-data
  const OLD_COMMIT_HASH = 'd7ef6fd7ef9bac4c24f5634e6b1e76d201507498';
  // Forcefully move back a number of commits, then invalidate the data
  const git = simpleGit(getDataDir());
  await git.reset(['--hard', OLD_COMMIT_HASH]);
  await api.admin.data.refresh();
  // Attempt to make a commit just in case of data migrations
  await api.admin.git.commit('Migrate data').catch(e => { void e });
}
