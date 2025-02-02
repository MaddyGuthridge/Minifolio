import { getItemData } from '$lib/server/data/item';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json(await getItemData('/'));
}
