import { error, redirect } from '@sveltejs/kit';
import { authIsSetUp, dataIsSetUp } from '$lib/server/data/dataDir';
import { isRequestAuthorized } from '$lib/server/auth/tokens';
import { formatItemId, itemIdFromUrl } from '$lib/itemId';
import { getItemData, itemExists } from '$lib/server/data/item';
import { getConfig } from '$lib/server/data/config';

export async function load(req: import('./$types').RequestEvent) {
  if (!await authIsSetUp()) {
    redirect(303, '/admin/firstrun/account');
  }
  if (!await dataIsSetUp()) {
    redirect(303, '/admin/firstrun/data');
  }
  const itemId = itemIdFromUrl(req.params.item);

  if (!await itemExists(itemId)) {
    error(404, `Item ${formatItemId(itemId)} does not exist`);
  }
  const portfolio = await getItemData([]);
  const config = await getConfig();
  const item = await getItemData(itemId);

  return {
    itemId,
    item,
    portfolio,
    config,
    loggedIn: await isRequestAuthorized(req)
  };
}
