import type { ItemId } from '$lib/server/data/itemId';
import sanitize from 'sanitize-filename';
import fs from 'fs/promises';
import path from 'path';
import { error, json } from '@sveltejs/kit';
import mime from 'mime-types';
import { getDataDir } from '$lib/server/data/dataDir';
import type { Request } from './+server';
import { invalidatePortfolioGlobals } from '$lib/server';

export async function getFile(req: Request, item: ItemId, file: string): Promise<Response> {
  // Sanitize the filename to prevent unwanted access to the server's filesystem
  const filename = sanitize(file);

  // Get the path of the file to serve
  const filePath = path.join(getDataDir(), ...item, filename);

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

export async function updateFile(item: ItemId, file: string, req: Request): Promise<Response> {
  // Sanitize the filename to prevent unwanted access to the server's filesystem
  const filename = sanitize(file);

  // Get the path of the file to update
  const filePath = path.join(getDataDir(), ...item, filename);

  // Ensure Content-Type header matches expected mimetype of header
  const fileMimeType = mime.contentType(filename);
  const reqMimeType = req.request.headers.get('Content-Type');

  if (req.request.body === null) {
    error(400, 'Request body must be given');
  }

  // Only check if the mimetype of the file is known
  if (fileMimeType && fileMimeType !== reqMimeType) {
    error(400, `Incorrect mimetype for file ${filename}. Expected ${fileMimeType}, got ${reqMimeType}`);
  }

  // It would probably be nicer to pipe the data directly to the disk as it is received
  // but I am unable to make TypeScript happy.
  // Even then, this way, EsLint claims I'm calling an error-type value, which is cursed.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const data = await req.request.bytes();

  // Write the file
  await fs.writeFile(filePath, data).catch(e => error(404, `${e}`));

  invalidatePortfolioGlobals();

  return json({});
}
