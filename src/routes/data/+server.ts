import itemId from '#lib/itemId.ts';
import { getItemData } from '#lib/server/data/item/index.ts';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json(await getItemData(itemId.ROOT));
}
