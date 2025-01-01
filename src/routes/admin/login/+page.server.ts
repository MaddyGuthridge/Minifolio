import { getPortfolioGlobals } from '$lib/server';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { redirect } from '@sveltejs/kit';

export async function load(req: import('./$types').RequestEvent) {
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
  const globals = await getPortfolioGlobals();
  return { globals };
}
