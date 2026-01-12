import fs from 'node:fs/promises';
import { json, error } from '@sveltejs/kit';
import z from 'zod';

import itemId from '$lib/itemId';
import { deleteItem, getItemInfo, itemExists, itemPath, setItemInfo, validateItemInfo } from '$lib/server/data/item';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import validate from '$lib/validate';
import formatTemplate from '$lib/server/formatTemplate';
import { ITEM_README } from '$lib/server/data/text';
import { dataIsSetUp } from '$lib/server/data/dataDir';
import { unixTime } from '$lib/util';

/**
 * API endpoints for accessing info.json
 */
type Request = import('./$types').RequestEvent;

/** Get item info.json */
export async function GET(req: Request) {
  const item = validate.itemId.parse(`/${req.params.item}`);
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  return json(await getItemInfo(item));
}

/** Allowed options when creating a new item */
const NewItemOptions = z.strictObject({
  name: validate.name,
  description: z.string(),
});

/** Create new item */
export async function POST(req: Request) {
  await validateTokenFromRequest(req);
  const item = validate.itemId.parse(`/${req.params.item}`);

  // Ensure parent exists
  const parent = await getItemInfo(itemId.parent(item))
    .catch(() => error(404, `Parent of '${item}' ('${itemId.parent(item)}') does not exist`));
  // Check if item exists
  if (await itemExists(item)) {
    error(400, `Item '${item}' already exists`);
  }
  // Validate item properties
  const { name, description } = await NewItemOptions.parseAsync(await req.request.json())
    .catch(e => error(400, e));

  const itemInfo = await validateItemInfo(item, {
    name,
    shortName: null,
    author: null,
    description,
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: 'README.md',
    article: false,
    feed: null,
    icon: null,
    banner: null,
    color: parent.color,
    sections: [],
    children: [],
    filters: [],
    seo: {
      description: null,
      keywords: [name],
    },
  });

  // mkdir
  await fs.mkdir(itemPath(item));
  // Set info.json
  await setItemInfo(item, itemInfo);
  // Set README.md
  const readme = formatTemplate(ITEM_README, { item: name, description })
    // If the description was empty, we'll end up with extra newlines -- get
    // rid of them.
    .replace('\n\n\n', '');

  await fs.writeFile(itemPath(item, 'README.md'), readme, { encoding: 'utf-8' });

  // Add item to parent's children
  parent.children.push(itemId.suffix(item));
  await setItemInfo(itemId.parent(item), parent);

  return json(itemInfo);
}

/** Update item info.json */
export async function PUT(req: Request) {
  await validateTokenFromRequest(req);
  const item = validate.itemId.parse(`/${req.params.item}`);
  // Check if item exists
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  // Validate properties
  const itemInfo = await validateItemInfo(item, await req.request.json());
  await setItemInfo(item, itemInfo);
  return json({});
}

/** Delete item */
export async function DELETE(req: Request) {
  await validateTokenFromRequest(req);
  const item = validate.itemId.parse(`/${req.params.item}`);
  // Prevent the Minifolio equivalent of `rm -rf /`
  if (item === '/') {
    error(403, 'Cannot delete root item');
  }
  // Check if item exists
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  await deleteItem(item);
  return json({});
}
