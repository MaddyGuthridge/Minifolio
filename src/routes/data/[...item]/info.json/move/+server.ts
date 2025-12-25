import itemId, { ItemIdStruct } from '$lib/itemId';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { itemExists } from '$lib/server/data/item';
import { moveItem } from '$lib/server/data/item/item';
import { json, error } from '@sveltejs/kit';
import z from 'zod';

type Request = import('./$types').RequestEvent;

const MoveOptions = z.strictObject({ target: ItemIdStruct });

/** Move item to new location */
export async function POST(req: Request) {
  const item = itemId.validate(`/${req.params.item}`);
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }

  const { target } = await MoveOptions.parseAsync(await req.request.json())
    .catch(e => error(400, e));

  await moveItem(item, target);
  return json({});
}
