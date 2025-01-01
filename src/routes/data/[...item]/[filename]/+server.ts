/**
 * API endpoints for accessing and modifying generic files.
 */
import fs from 'fs/promises';
import { error, json } from '@sveltejs/kit';
import sanitize from 'sanitize-filename';
import mime from 'mime-types';
import { formatItemId, itemIdFromUrl, type ItemId } from '$lib/server/data/itemId';
import { fileExists } from '$lib/server/util';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { getItemData, itemExists, itemPath } from '$lib/server/data/item';
type Request = import('./$types').RequestEvent;

/** GET request handler, returns file contents */
export async function GET(req: Request) {
  const item: ItemId = itemIdFromUrl(req.params.item);

  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  // Sanitize the filename to prevent unwanted access to the server's filesystem
  const filename = sanitize(req.params.filename);

  // If this is a request to an item directory (not a file within it), then return the full info on
  // the item.
  if (!await itemExists([...item, filename])) {
    return json(await getItemData([...item, filename]));
  }

  // Get the path of the file to serve
  const filePath = itemPath(item, filename);

  // Ensure file exists
  await fs.access(filePath, fs.constants.R_OK).catch(() => error(404));

  // Read the contents of the file
  const content = await fs.readFile(filePath);
  let mimeType = mime.contentType(filename);
  if (!mimeType) {
    mimeType = 'text/plain';
  }

  req.setHeaders({
    'Content-Type': mimeType,
    'Content-Length': content.length.toString(),
  });

  return new Response(content);
}

/**
 * Update the file at the given path using data from the given request.
 *
 * Note: this does not sanitize the given file path, so that must be done by the caller.
 */
async function updateFileFromRequest(filename: string, req: Request): Promise<void> {
  // Load the full form data
  // Kinda annoying that we have to load it all into memory, but I was unable to convince libraries
  // like `busboy` and `formidable` to work nicely.
  const form = await req.request.formData();
  const content = form.get('content')!;
  if (!(content instanceof File)) {
    error(400, '"content" field of form must have type `File`');
  }

  // No idea why ESLint claims that `content.bytes` has an "error" type. It works fine, and
  // TypeScript is perfectly happy with it.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fs.writeFile(filename, await content.bytes());
}

/** POST request handler, creates file (if it doesn't exist) */
export async function POST(req: Request) {
  await validateTokenFromRequest(req);
  const item: ItemId = itemIdFromUrl(req.params.item);
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (await fileExists(file)) {
    error(400, `File '${filename}' already exists for item ${formatItemId(item)}`);
  }

  await updateFileFromRequest(file, req);
  return json({});
}

/** PUT request handler, updates file */
export async function PUT(req: Request) {
  await validateTokenFromRequest(req);
  const item: ItemId = itemIdFromUrl(req.params.item);
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (!await fileExists(file)) {
    error(404, `File '${filename}' does not exist for item ${formatItemId(item)}`);
  }

  await updateFileFromRequest(file, req);
  return json({});
}

/** DELETE request handler, removes file */
export async function DELETE(req: Request) {
  await validateTokenFromRequest(req);
  const item: ItemId = itemIdFromUrl(req.params.item);
  if (!await itemExists(item)) {
    error(404, `Item ${formatItemId(item)} does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (!await fileExists(file)) {
    error(404, `File '${filename}' does not exist for item ${formatItemId(item)}`);
  }

  // TODO: Update properties of info.json to remove references to the file

  await fs.unlink(file);
  return json({});
}
