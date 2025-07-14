import { isRequestAuthorized } from '$lib/server/auth/tokens';
// import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
// import { VERSION as SVELTEKIT_VERSION } from '@sveltejs/kit';
// import { version as VITE_VERSION } from 'vite';
import os from 'node:os';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { getItemData, type ItemData } from '$lib/server/data/item';
import { blankData } from '../../lib/blankData';
import itemId from '$lib/itemId';
import { getConfig } from '$lib/server/data/config';

export async function load(req: import('./$types').RequestEvent) {
  const isInit = await dataIsSetUp();
  const loggedIn = isInit ? await isRequestAuthorized(req) : undefined;

  // FIXME: Super wasteful to load all data here,,,
  const portfolio: ItemData = isInit ? await getItemData(itemId.ROOT) : blankData;
  let siteIcon: string | undefined = undefined;
  if (isInit) {
    siteIcon = (await getConfig()).siteIcon ?? undefined;
  }

  let versions = null;
  if (!isInit || loggedIn) {
    versions = {
      node: process.version,
      os: `${os.platform()} ${os.release()}`,
    };
  }

  return {
    portfolio,
    siteIcon,
    loggedIn,
    versions,
  };
}
