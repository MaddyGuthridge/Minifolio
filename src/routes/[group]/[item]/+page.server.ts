import { error } from '@sveltejs/kit';
import { getPortfolioGlobals } from '$lib/server';
import { isRequestAuthorized } from '$lib/server/auth/tokens';

export async function load(req: import('./$types.js').RequestEvent) {
  const globals = await getPortfolioGlobals();
  // Give a 404 if the group doesn't exist
  if (!(req.params.group in globals.groups)) {
    error(404, `Group '${req.params.group}' does not exist`);
  }
  // And also if the item doesn't exist
  if (!(req.params.item in globals.items[req.params.group])) {
    error(404, `Item '${req.params.item}' does not exist within group '${req.params.group}`);
  }
  return {
    groupId: req.params.group,
    itemId: req.params.item,
    globals,
    loggedIn: await isRequestAuthorized(req),
  };
}
