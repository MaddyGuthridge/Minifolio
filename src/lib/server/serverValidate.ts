/**
 * Validations that can only be performed server-side.
 */
import fs from 'fs/promises';
import { error } from '@sveltejs/kit';
import sanitize from 'sanitize-filename';
import { getDataDir } from './data/dataDir';
import path from 'path';
import { contentType } from 'mime-types';
import type { ItemId } from '$lib/itemId';


/** Validate that the given file exists, and is readable */
export async function validateFile(itemId: ItemId, filename: string): Promise<string> {
  const sanitized = sanitize(filename);
  if (!sanitized) {
    error(400, 'File path cannot be empty');
  }
  await fs.access(path.join(getDataDir(), itemId, sanitized), fs.constants.R_OK)
    .catch(e => error(400, `Error accessing ${sanitized}: ${e}`));
  return sanitized;
}

/** Validate that an image path is valid */
export async function validateImage(itemId: ItemId, filename: string): Promise<string> {
  const file = await validateFile(itemId, filename);
  const mimeType = contentType(file);
  if (mimeType && !mimeType.startsWith('image/')) {
    error(400, 'Image path must have a mimetype beginning with "image/"');
  }
  return file;
}

export default {
  file: validateFile,
  image: validateImage,
};
