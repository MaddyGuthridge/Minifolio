import { error } from '@sveltejs/kit';
import { getItemData, itemExists } from '#lib/server/data/item/index.ts';
import { getConfig } from '#lib/server/data/config.ts';
import itemId from '#lib/itemId.ts';
import { redirectForSetup, redirectOnInvalidToken } from '#lib/server/redirects.ts';
import validate from '#lib/validate.ts';

export async function load(req: import('./$types').RequestEvent) {
  await redirectForSetup();
  const item = validate.parse(validate.itemId, `/${req.params.item.replace(/^\//, '')}`);

  await redirectOnInvalidToken(req, '/admin/login');
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
  };
}
