/**
 * API endpoints for accessing and modifying an item's README.md.
 *
 * Note that POST and DELETE methods are unavailable, as the lifetime of the README.md file should
 * match that of the item itself.
 */
import { formatItemId, itemIdFromUrl, type ItemId } from '$lib/itemId';
import fs from 'fs/promises';
import { error, json } from '@sveltejs/kit';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { itemExists, itemPath } from '$lib/server/data/item';
import { dataIsSetUp } from '$lib/server/data/dataDir';
type Request = import('./$types').RequestEvent;

/** GET request handler, returns README text */
export async function GET(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  const item: ItemId = itemIdFromUrl(req.params.item);
  const filePath = itemPath(item, 'README.md');
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  const readme = await fs.readFile(filePath, { encoding: 'utf-8' });
  req.setHeaders({
    'Content-Type': 'text/markdown',
    'Content-Length': readme.length.toString(),
  });

  return new Response(readme);
}

/** PUT request handler, updates README text */
export async function PUT(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest(req);
  const item: ItemId = itemIdFromUrl(req.params.item);
  const filePath = itemPath(item, 'README.md');
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  const readme = await req.request.text();
  await fs.writeFile(filePath, readme, { encoding: 'utf-8' });

  return json({});
}
