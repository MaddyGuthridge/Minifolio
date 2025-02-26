/**
 * API endpoints for accessing and modifying generic files.
 */
import fs from 'node:fs/promises';
import { error, json } from '@sveltejs/kit';
import sanitize from 'sanitize-filename';
import mime from 'mime-types';
import itemId, { type ItemId } from '$lib/itemId';
import { fileExists } from '$lib/server/util';
import { validateTokenFromRequest } from '$lib/server/auth/tokens';
import { getItemData, getItemInfo, itemExists, itemPath } from '$lib/server/data/item';
import { dataIsSetUp } from '$lib/server/data/dataDir';
type Request = import('./$types').RequestEvent;

/** GET request handler, returns file contents */
export async function GET(req: Request) {
  const item: ItemId = itemId.validate(`/${req.params.item}`);
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }

  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  // Sanitize the filename to prevent unwanted access to the server's filesystem
  const filename = sanitize(req.params.filename);

  // If this is a request to an item directory (not a file within it), then return the full info on
  // the item.
  if (await itemExists(itemId.child(item, filename))) {
    return json(await getItemData(itemId.child(item, filename)));
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

function mimeTypeMatches(contentType: string, matchers: (string | RegExp)[]): boolean {
  return matchers.some((matcher) => {
    // If type is `string`, check for direct equality
    if (typeof matcher === 'string') {
      return contentType === matcher;
    } else {
      // Otherwise, it's a regex
      return matcher.test(contentType);
    }
  });
}

const FORM_DATA_CONTENT_TYPES = [
  // Multipart form-data can have extra content in the mime-type, so we only match the start of it
  // It either ends with `$` (end of string), or `;` as a separator before the additional data
  // Example of a matched string: 'Content type: multipart/form-data; boundary=----formdata-undici-074183355857'
  /^multipart\/form-data($|;)/,
  'application/x-www-form-urlencoded'
];
/** Update the given file using data from the given request's form data */
async function updateFileFromFormData(filename: string, req: Request): Promise<void> {
  // Load the full form data
  // Kinda annoying that we have to load it all into memory, but I was unable to convince libraries
  // like `busboy` and `formidable` to work nicely.
  const form = await req.request.formData();
  const content = form.get('content')!;
  if (!(content instanceof File)) {
    error(400, '"content" field of form must have type `File`');
  }

  await fs.writeFile(filename, await content.bytes());
}

const PLAINTEXT_CONTENT_TYPES = [
  /^text\/\w*$/,
  'application/json',
  'application/xml',
];
/** Update the given file using data from the given request's body as plain-text */
async function updateFileFromText(filename: string, req: Request): Promise<void> {
  await fs.writeFile(filename, await req.request.text(), { encoding: 'utf-8' });
}

/** Update the given file using data from the given request's body as binary data */
async function updateFileFromBytes(filename: string, req: Request): Promise<void> {
  await fs.writeFile(filename, await req.request.bytes());
}

/**
 * Update the file at the given path using data from the given request.
 *
 * Note: this does not sanitize the given file path, so that must be done by the caller.
 */
async function updateFileFromRequest(filename: string, req: Request): Promise<void> {
  const contentType = req.request.headers.get('Content-Type');
  if (!contentType) {
    error(400, 'Content-Type header must be set');
  }

  if (mimeTypeMatches(contentType, FORM_DATA_CONTENT_TYPES)) {
    // If request is form data, then extract the file from the `content` field of the form
    await updateFileFromFormData(filename, req);
  } else if (mimeTypeMatches(contentType, PLAINTEXT_CONTENT_TYPES)) {
    // Otherwise, if it's plaintext, write it out in utf-8
    await updateFileFromText(filename, req);
  } else {
    // As a final fall-back, just write the binary data
    await updateFileFromBytes(filename, req);
  }
}

/** POST request handler, creates file (if it doesn't exist) */
export async function POST(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest(req);
  const item: ItemId = itemId.validate(`/${req.params.item}`);
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (await fileExists(file)) {
    error(400, `File '${filename}' already exists for item '${item}'`);
  }

  await updateFileFromRequest(file, req);
  return json({});
}

/** PUT request handler, updates file */
export async function PUT(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest(req);
  const item: ItemId = itemId.validate(`/${req.params.item}`);
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (!await fileExists(file)) {
    error(404, `File '${filename}' does not exist for item '${item}'`);
  }

  await updateFileFromRequest(file, req);
  return json({});
}

/** DELETE request handler, removes file */
export async function DELETE(req: Request) {
  if (!await dataIsSetUp()) {
    error(400, 'Data is not set up');
  }
  await validateTokenFromRequest(req);
  const item: ItemId = itemId.validate(`/${req.params.item}`);
  if (!await itemExists(item)) {
    error(404, `Item '${item}' does not exist`);
  }
  const filename = sanitize(req.params.filename);
  const file = itemPath(item, filename);

  if (!await fileExists(file)) {
    error(404, `File '${filename}' does not exist for item '${item}'`);
  }

  // If file is referenced in `info.json`, give an error
  const itemInfo = await getItemInfo(item);
  if (itemInfo.banner === filename) {
    error(400, `Cannot remove file ${filename} because it is referenced as the item banner image`);
  }
  if (itemInfo.icon === filename) {
    error(400, `Cannot remove file ${filename} because it is referenced as the item icon image`);
  }
  if (itemInfo.readme === filename) {
    error(400, `Cannot remove file ${filename} because it is referenced as the item readme`);
  }

  await fs.unlink(file);
  return json({});
}
