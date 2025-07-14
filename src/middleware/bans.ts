import { authIsSetUp } from '$lib/server/data/dataDir';
import { getLocalConfig } from '$lib/server/data/localConfig';
import { getIpFromRequest } from '$lib/server/request';
import { error, type Handle } from '@sveltejs/kit';

const banMiddleware: Handle = async (req) => {
  if (
    // Allow all requests if server isn't set up
    !await authIsSetUp()
    // Allow all requests to debug endpoints
    || req.event.url.pathname.startsWith('/api/debug')
  ) {
    return req.resolve(req.event);
  }
  const config = await getLocalConfig();
  const ip = await getIpFromRequest(req.event);
  if (config.bannedIps.includes(ip)) {
    error(403, 'This IP address is banned');
  }
  const userAgent = req.event.request.headers.get('User-Agent');
  if (!userAgent) {
    error(403, 'Please set a User-Agent header identifying your application.');
  }
  for (const regex of config.bannedUserAgents) {
    if (RegExp(regex).test(userAgent)) {
      error(403, 'Your User-Agent is banned');
    }
  }
  // They are fine, let them access the site
  return req.resolve(req.event);
};

export default banMiddleware;
