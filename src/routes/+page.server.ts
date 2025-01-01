import { redirect } from '@sveltejs/kit';
import { getPortfolioGlobals } from '$lib/server';
import { authIsSetUp, dataIsSetUp } from '$lib/server/data/dataDir';
import { isRequestAuthorized } from '$lib/server/auth/tokens';

export async function load(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    redirect(303, '/admin/firstrun/account');
  }
  if (!await dataIsSetUp()) {
    redirect(303, '/admin/firstrun/data');
  }
  const globals = await getPortfolioGlobals();
  return { globals, loggedIn: await isRequestAuthorized(req) };
}
