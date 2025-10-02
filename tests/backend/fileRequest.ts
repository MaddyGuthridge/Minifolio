/**
 * Code for creating a `File` object from a file on the file system.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
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
  return new File(
    // It seems that TypeScript doesn't like this, as it wants the arrayBuffer to be a `BlobPart`,
    // but given this seems to work throughout testing, I'd say this is fine.
    // FIXME: Figure out why it is so cranky.
    arrayBuffer as any,
    path.basename(file),
    { type: mimetype },
  );
}
