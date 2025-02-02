/**
 * Code for creating a `File` object from a file on the file system.
 */
import fs from 'fs/promises';
import path from 'path';
import { contentType } from 'mime-types';

/**
 * Create a `File` object from a file on the file system.
 *
 * Derived from https://github.com/abrwn/get-file-object-from-local-path/blob/main/index.js
 *
 * Modified to make it async.
 *
 * MIT License
 * * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
 * * Copyright (c) 2024 Maddy Guthridge <hello@maddyguthridge.com>
 */
export default async function fromFileSystem(file: string): Promise<File> {
  const buffer = await fs.readFile(file);
  const arrayBuffer = [buffer.subarray(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)];
  const mimetype = contentType(file) || undefined;
  return new File(arrayBuffer, path.basename(file), { type: mimetype });
}
