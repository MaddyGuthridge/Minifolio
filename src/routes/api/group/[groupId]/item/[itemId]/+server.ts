import { error, json } from '@sveltejs/kit';
import { getGroupInfo, setGroupInfo } from '$lib/server/data/group';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { object, string, validate } from 'superstruct';
import { createItem, setItemInfo, ItemInfoFullStruct, deleteItem } from '$lib/server/data/itemOld.js';
import { getPortfolioGlobals, invalidatePortfolioGlobals } from '$lib/server/data/index';
import { validateId, validateName } from '$lib/validators';
import { removeAllLinksToItem } from '$lib/server/links';

export async function GET({ params }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));

  const { groupId, itemId } = params;

  try {
    return json(data.items[groupId][itemId].info, { status: 200 });
  } catch (e) {
    return error(404, `Item at ID ${groupId}/item/${itemId} doesn't exist\n${e}`);
  }
}

export async function POST({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  // Validate group ID
  const { groupId, itemId } = params;

  // Ensure group exists
  await getGroupInfo(groupId).catch(e => error(404, e));

  validateId('Item ID', itemId);

  const [err, body] = validate(await request.json(), object({ name: string(), description: string() }));
  if (err) {
    return error(400, err);
  }
  const { name, description } = body;

  // Validate name
  validateName(name);

  if (data.items[groupId]?.[itemId]) {
    return error(400, `Group with ID ${groupId} already exists`);
  }

  await createItem(groupId, itemId, name, description);

  const groupInfo = data.groups[groupId].info;
  groupInfo.listedItems.push(itemId);
  groupInfo.filterItems.push(itemId);
  await setGroupInfo(groupId, groupInfo);
  invalidatePortfolioGlobals();

  return json({}, { status: 200 });
}

export async function PUT({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const { groupId, itemId } = params;

  if (!data.groups[groupId]) {
    error(404, `Group ${groupId} does not exist`);
  }
  if (!data.items[groupId][itemId]) {
    error(404, `Item ${itemId} does not exist in group ${groupId}`);
  }

  const [err, info] = validate(await request.json(), ItemInfoFullStruct);
  if (err) {
    return error(400, err);
  }

  // Validate name
  validateName(info.name);

  // TODO: Other validation

  await setItemInfo(groupId, itemId, info);
  invalidatePortfolioGlobals();

  return json({}, { status: 200 });
}

export async function DELETE({ params, request, cookies }: import('./$types.js').RequestEvent) {
  const data = await getPortfolioGlobals().catch(e => error(400, e));
  await validateTokenFromRequest({ request, cookies });

  const { groupId, itemId } = params;

  if (!data.groups[groupId]) {
    error(404, `Group ${groupId} does not exist`);
  }
  if (!data.items[groupId][itemId]) {
    error(404, `Item ${itemId} does not exist in group ${groupId}`);
  }

  // Remove all links to this item
  await removeAllLinksToItem(data, groupId, itemId);

  // Now delete the item
  await deleteItem(groupId, itemId);
  invalidatePortfolioGlobals();
  return json({}, { status: 200 });
}
