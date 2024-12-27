import fs from 'fs/promises';
import { json, error } from '@sveltejs/kit';
import { object, string } from 'superstruct';
import { formatItemId, itemIdFromUrl, itemIdTail, itemParent } from '$lib/server/data/itemId';
import { deleteItem, getItemInfo, itemExists, itemPath, setItemInfo, validateItemInfo } from '$lib/server/data/item';
import { validateTokenFromRequest } from '$lib/server/auth/tokens.js';
import { applyStruct } from '$lib/server/util.js';
import { validateName } from '$lib/validate.js';
import formatTemplate from '$lib/server/formatTemplate.js';

/**
 * API endpoints for accessing info.json
 */
type Request = import('./$types.js').RequestEvent;

/** Get item info.json */
export async function GET(req: Request) {
  const item = itemIdFromUrl(req.params.item);
  return json(await getItemInfo(item));
}

/** Allowed options when creating a new item */
const NewItemOptions = object({
  name: string(),
  description: string(),
});

const DEFAULT_README = `
# {{item}}

{{description}}

This is the \`README.md\` file for the item {{item}}. Go ahead and modify it to
tell everyone more about it. Is it something you made, or something you use?
How does it demonstrate your abilities?
`;

/** Create new item */
export async function POST(req: Request) {
  await validateTokenFromRequest(req);
  const item = itemIdFromUrl(req.params.item);

  // Ensure parent exists
  const parent = await getItemInfo(itemParent(item))
    .catch(() => error(404, `Parent of ${formatItemId(item)} does not exist`));
  // Check if item exists
  if (await itemExists(item)) {
    error(400, `Item ${formatItemId(item)} already exists`);
  }
  // Validate item properties
  const { name, description } = applyStruct(await req.request.json(), NewItemOptions);
  validateName(name);

  const itemInfo = await validateItemInfo(item, {
    name,
    description,
    shortName: null,
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
  const readme = formatTemplate(DEFAULT_README, { item: name, description })
    // If the description was empty, we'll end up with extra newlines -- get
    // rid of them.
    .replace('\n\n\n', '');

  await fs.writeFile(itemPath(item, 'README.md'), readme, { encoding: 'utf-8' });

  // Add item to parent's children
  parent.children.push(itemIdTail(item));
  await setItemInfo(itemParent(item), parent);

  return json({});
}

/** Update item info.json */
export async function PUT(req: Request) {
  await validateTokenFromRequest(req);
  const item = itemIdFromUrl(req.params.item);
  // Check if item exists
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  // Validate properties
  const itemInfo = await validateItemInfo(item, await req.request.json());
  await setItemInfo(item, itemInfo);
  return json({});
}

/** Delete item */
export async function DELETE(req: Request) {
  await validateTokenFromRequest(req);
  const item = itemIdFromUrl(req.params.item);
  // Prevent the Minifolio equivalent of `rm -rf /`
  if (item.length == 0) {
    error(403, 'Cannot delete root item');
  }
  // Check if item exists
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  await deleteItem(item);
  return json({});
}
