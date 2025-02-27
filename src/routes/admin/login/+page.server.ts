import itemId from '$lib/itemId';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { getConfig } from '$lib/server/data/config';
import { authIsSetUp } from '$lib/server/data/dataDir';
import { getItemData } from '$lib/server/data/item';
import { redirect } from '@sveltejs/kit';

export async function load(req: import('./$types').RequestEvent) {
  // Don't use redirectForSetup, as this route should be available as soon as
  // the first account is created
  if (!await authIsSetUp()) {
    redirect(303, '/admin/firstrun/account');
  }
  // Users that are already logged in should be redirected to the main admin
  // page
  let loggedIn = false;
  try {
    await validateTokenFromRequest(req);
    // Success, redirect them
    loggedIn = true;
  } catch { /* empty */ }
  if (loggedIn) {
    // If they are logged in, redirect them to the `from` URL if it exists.
    redirect(303, req.url.searchParams.get('from') ?? '/');
  }
  const portfolio = await getItemData(itemId.ROOT);
  const config = await getConfig();
  return { portfolio, config };
}
