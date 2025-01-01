import { getPortfolioGlobals } from '$lib/server';
import { isRequestAuthorized } from '$lib/server/auth/tokens';
import blankConfig from '$lib/blankConfig';
import type { ConfigJson } from '$lib/server/data/config';
import { version } from '$app/environment';
// import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
// import { VERSION as SVELTEKIT_VERSION } from '@sveltejs/kit';
// import { version as VITE_VERSION } from 'vite';
import os from 'os';

export async function load(req: import('./$types').RequestEvent) {
  // If config fails to load (eg firstrun), just give a blank config
  let config: ConfigJson;
  let isInit = true;
  try {
    const globals = await getPortfolioGlobals();
    config = globals.config;
  } catch {
    isInit = false;
    config = blankConfig;
  }

  const loggedIn = isInit ? await isRequestAuthorized(req) : undefined;

  let versions = null;
  if (!isInit || loggedIn) {
    versions = {
      site: version,
      node: process.version,
      os: `${os.platform()} ${os.release()}`
    };
  }

  return {
    config,
    loggedIn,
    versions,
  };
}
