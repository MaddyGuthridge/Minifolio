/**
 * validate.ts
 *
 * Contains common validator functions shared throughout the app.
 */
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import mime from 'mime-types';
import sanitize from 'sanitize-filename';
import type { ItemId } from './server/data/itemId';
import { getDataDir } from './server/data/dataDir';
import path from 'path';

/** Regex for matching ID strings */
export const idValidatorRegex = /^[a-z0-9-.]+$/;

/**
 * Ensure that the given ID string is valid.
 *
 * @param type the type of ID being validated (used to produce helpful error messages).
 * @param id the ID string to validate.
 */
export function validateId(type: string, id: string): string {
  if (!id.trim().length) {
    error(400, `${type} '${id}' is empty`);
  }
  if (!idValidatorRegex.test(id)) {
    error(400, `${type} '${id}' is contains illegal characters`);
  }
  if (id.startsWith('.')) {
    error(400, `${type} '${id}' has a leading dot`);
  }
  if (id.endsWith('.')) {
    error(400, `${type} '${id}' has a trailing dot`);
  }
  if (id.startsWith('-')) {
    error(400, `${type} '${id}' has a leading dash`);
  }
  if (id.endsWith('-')) {
    error(400, `${type} '${id}' has a trailing dash`);
  }
  return id;
}

/** Array of illegal characters that cannot be used in names */
const illegalNameChars = ['\t', '\n', '\f', '\r'];

/** Ensure that the given name is valid */
export function validateName(name: string): string {
  if (!name) {
    error(400, 'Name cannot be empty');
  }
  if (name.trim().length !== name.length) {
    error(400, 'Name cannot contain leading or trailing whitespace');
  }
  if (
    illegalNameChars
      .reduce((n, c) => n.replace(c, ''), name)
      .length
    !== name.length
  ) {
    error(400, 'Name contains illegal whitespace characters');
  }

  return name;
}

const colorValidatorRegex = /^#[0-9a-fA-F]{3,6}$/;

/** Validate a color is in hex form */
export function validateColor(color: string): string {
  if (!colorValidatorRegex.test(color)) {
    error(400, 'Colors must be given in hex form (#RRGGBB)');
  }
  return color;
}

/** Validate that the given file exists, and is readable */
export async function validateFile(itemId: ItemId, filename: string): Promise<string> {
  const sanitized = sanitize(filename);
  if (!sanitized) {
    error(400, 'File path cannot be empty');
  }
  await fs.access(path.join(getDataDir(), ...itemId, sanitized), fs.constants.R_OK)
    .catch(e => error(400, `Error accessing ${sanitized}: ${e}`));
  return sanitized;
}

/** Validate that an image path is valid */
export async function validateImage(itemId: ItemId, filename: string): Promise<string> {
  const file = await validateFile(itemId, filename);
  const mimeType = mime.contentType(file);
  if (!mimeType || !mimeType.startsWith('image/')) {
    error(400, 'Image path must have a mimetype beginning with "image/"');
  }
  return file;
}

export default {
  id: validateId,
  name: validateName,
  color: validateColor,
  file: validateFile,
  image: validateImage,
};
