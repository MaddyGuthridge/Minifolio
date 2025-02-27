import { error } from '@sveltejs/kit';
import { isRequestAuthorized } from '$lib/server/auth/tokens';
import { getItemData, itemExists } from '$lib/server/data/item';
import { getConfig } from '$lib/server/data/config';
import itemId from '$lib/itemId';
import { redirectForSetup } from '$lib/server/redirects';

export async function load(req: import('./$types').RequestEvent) {
  await redirectForSetup();
  const item = itemId.validate(`/${req.params.item}`);

  if (!await itemExists(item)) {
    error(404, `Item ${item} does not exist`);
  }
  const portfolio = await getItemData(itemId.ROOT);
  const config = await getConfig();
  const itemInfo = await getItemData(item);

  return {
    itemId: item,
    item: itemInfo,
    portfolio,
    config,
    loggedIn: await isRequestAuthorized(req)
  };
}
