import { isRequestAuthorized } from '$lib/server/auth/tokens';
import { version } from '$app/environment';
// import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
// import { VERSION as SVELTEKIT_VERSION } from '@sveltejs/kit';
// import { version as VITE_VERSION } from 'vite';
import os from 'os';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { getItemData, type ItemData } from '$lib/server/data/item';

export async function load(req: import('./$types').RequestEvent) {
  const isInit = await dataIsSetUp();
  const loggedIn = isInit ? await isRequestAuthorized(req) : undefined;

  const portfolio: ItemData = isInit ? await getItemData([]) : {
    info: {
      name: 'Minifolio',
      shortName: null,
      description: '',
      color: '#ff00ff',
      icon: null,
      banner: null,
      children: [],
      filters: [],
      sections: [],
      seo: { description: null, keywords: [] },
    },
    readme: '',
    children: {},
  }

  let versions = null;
  if (!isInit || loggedIn) {
    versions = {
      site: version,
      node: process.version,
      os: `${os.platform()} ${os.release()}`
    };
  }

  return {
    portfolio,
    loggedIn,
    versions,
  };
}
