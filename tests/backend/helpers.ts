import api, { type ApiClient } from '$endpoints';
import type { ConfigJson } from '$lib/server/data/config';
import { version } from '$app/environment';
import type { ItemInfo } from '$lib/server/data/item';
import type { ItemId } from '$lib/itemId';
import { unixTime } from '$lib/util';

/** Set up the server, returning (amongst other things) an API client */
export async function setup(repoUrl?: string, branch?: string) {
  const username = 'admin';
  const password = 'abc123ABC!';
  const { token } = await api().admin.firstrun.account(username, password);
  const client = api(fetch, token);
  await client.admin.firstrun.data(repoUrl, branch);
  return {
    api: client,
    token,
    username,
    password,
  };
}

/** Create custom config.json object */
export function makeConfig(options: Partial<ConfigJson> = {}): ConfigJson {
  const config: ConfigJson = {
    siteIcon: null,
    verification: {
      relMe: [],
      atProtocol: null,
      google: null,
      bing: null,
    },
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
    author: null,
    shortName: null,
    description: 'Item description',
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: 'README.md',
    article: false,
    feed: null,
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
