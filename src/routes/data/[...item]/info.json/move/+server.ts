import itemId, { ItemIdStruct } from '$lib/itemId';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { getItemInfo, itemExists, itemPath, setItemInfo } from '$lib/server/data/item';
import { applyStruct, move } from '$lib/server/util';
import { json, error } from '@sveltejs/kit';
import { object } from 'superstruct';

type Request = import('./$types').RequestEvent;

/** Move item to new location */
export async function POST(req: Request) {
  const item = itemId.validate(`/${req.params.item}`);
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }

  const { target } = applyStruct(await req.request.json(), object({ target: ItemIdStruct }));

  if (itemId.isChild(target, item)) {
    error(400, `Cannot move '${item}' to a child of itself`);
  }

  const newParentId = itemId.parent(target);
  if (!await itemExists(newParentId)) {
    error(400, `Cannot move '${item}' - parent of target '${target}' does not exist`);
  }

  if (await itemExists(target)) {
    error(400, `Cannot move '${item}' - content already exists at target '${target}'`);
  }

  // Move from old item to new item
  await move(itemPath(item), itemPath(target));

  // Remove from listed children of parent
  const oldParent = await getItemInfo(itemId.parent(item));
  const oldSuffix = itemId.suffix(item);
  const listed = oldParent.children.includes(oldSuffix);
  if (listed) {
    // Remove from listed children of old parent
    oldParent.children = oldParent.children.filter(child => child !== oldSuffix);
    await setItemInfo(itemId.parent(item), oldParent);
    // Add to listed children of new parent
    const newParent = await getItemInfo(newParentId);
    newParent.children.push(itemId.suffix(target));
    await setItemInfo(newParentId, newParent);
  }

  return json({});
}
