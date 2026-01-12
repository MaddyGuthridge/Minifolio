import { dataIsSetUp } from '$lib/server/data/dataDir';
import { itemExists } from '$lib/server/data/item';
import { moveItem } from '$lib/server/data/item/item';
import validate from '$lib/validate';
import { json, error } from '@sveltejs/kit';
import z from 'zod';

type Request = import('./$types').RequestEvent;

const MoveOptions = z.strictObject({ target: validate.itemId });

/** Move item to new location */
export async function POST(req: Request) {
  const item = validate.itemId.parse(`/${req.params.item}`);
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }

  const { target } = validate.parse(MoveOptions, await req.request.json());

  await moveItem(item, target);
  return json({});
}
