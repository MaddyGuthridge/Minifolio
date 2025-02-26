/**
 * Test cases for uploading files to an item.
 */

import { it, describe, beforeEach, expect } from 'vitest';
import genTokenTests from '../tokenCase';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import { readFile } from 'node:fs/promises';
import itemId from '$lib/itemId';
import { payload } from '$endpoints/fetch';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  // Create file `example.md`
  await api
    .item(itemId.ROOT)
    .file('example.md')
    .post(payload.file(await fromFileSystem('README.md')));
});


describe('Success', () => {
  it('Updates the file', async () => {
    await api
      .item(itemId.ROOT)
      .file('example.md')
      .put(payload.file(await fromFileSystem('LICENSE.md')));

    // Contents should be updated
    const content = await api.item(itemId.ROOT).file('example.md').get().text();
    expect(content).toStrictEqual(await readFile('LICENSE.md', { encoding: 'utf-8' }));
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    async api => api
      .item(itemId.ROOT)
      .file('example.md')
      .put(payload.file(await fromFileSystem('README.md'))),
  );
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(
      api
        .item(itemId.fromStr('/invalid'))
        .file('file')
        .put(payload.file(await fromFileSystem('LICENSE.md')))
    ).rejects.toMatchObject({ code: 404 });
  });
  it('Errors if the file does not exist', async () => {
    await expect(
      api
        .item(itemId.ROOT)
        .file('invalid')
        .put(payload.file(await fromFileSystem('LICENSE.md')))
    ).rejects.toMatchObject({ code: 404 });
  });
});
