/**
 * API endpoints for accessing and modifying generic files.
 */
import { formatItemId, itemIdFromUrl, type ItemId } from '$lib/server/data/itemId';
import sanitize from 'sanitize-filename';
import fs from 'fs/promises';
import { error, json } from '@sveltejs/kit';
import mime from 'mime-types';
import { fileExists } from '$lib/server/index.js';
import { validateTokenFromRequest } from '$lib/server/auth/tokens.js';
import { itemPath } from '$lib/server/data/item.js';
type Request = import('./$types.js').RequestEvent;

/** GET request handler, returns file contents */
export async function GET(req: Request) {
  const item: ItemId = itemIdFromUrl(req.params.item);
  // Sanitize the filename to prevent unwanted access to the server's filesystem
  const filename = sanitize(req.params.filename);
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
async function updateFileFromRequest(file: string, req: Request): Promise<void> {
  // Ensure Content-Type header matches expected mimetype of header
  const fileMimeType = mime.contentType(file);
  const reqMimeType = req.request.headers.get('Content-Type');

  if (req.request.body === null) {
    error(400, 'Request body must be given');
  }

  // Only check if the mimetype of the file is known
  if (fileMimeType && fileMimeType !== reqMimeType) {
    error(400, `Incorrect mimetype for file ${file}. Expected ${fileMimeType}, got ${reqMimeType}`);
  }

  // It would probably be nicer to pipe the data directly to the disk as it is received
  // but I am unable to make TypeScript happy.
  // Even then, this way, ESLint claims I'm calling an error-type value, which is cursed.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const data = await req.request.bytes();

  // Write the file
  await fs.writeFile(file, data).catch(e => error(400, `${e}`));
}

/** POST request handler, creates file (if it doesn't exist) */
export async function POST(req: Request) {
  await validateTokenFromRequest(req);
  const item: ItemId = itemIdFromUrl(req.params.item);
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
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (!await fileExists(file)) {
    error(404, `File '${filename}' does not exist for item ${formatItemId(item)}`);
  }

  // TODO: Update properties of info.json to remove references to the file

  await fs.unlink(file);
  return json({});
}
