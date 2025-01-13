import { error } from '@sveltejs/kit';
import { create, type Struct } from 'superstruct';
import fs from 'fs/promises';

/**
 * A wrapper around superstruct's assert, making it async to make error
 * handling easier.
 *
 * By default this throws an error 400.
 */
export function applyStruct<T, S>(
  value: unknown,
  struct: Struct<T, S>,
  message?: string,
): T {
  try {
    return create(value, struct, message);
  } catch (e) {
    error(400, `${e}`);
  }
}

/** Returns whether a file exists at the given path */
export async function fileExists(path: string): Promise<boolean> {
  return fs.access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
