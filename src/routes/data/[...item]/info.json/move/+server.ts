import itemId, { ItemIdStruct } from '$lib/itemId';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { itemExists } from '$lib/server/data/item';
import { applyStruct } from '$lib/server/util';
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


  if (!await itemExists(itemId.parent(target))) {
    error(400, `Cannot move '${item}' - parent of target '${target}' does not exist`);
  }

  if (await itemExists(target)) {
    error(400, `Cannot move '${item}' - content already exists at target '${target}'`);
  }

  // TODO

  return json({});
}
