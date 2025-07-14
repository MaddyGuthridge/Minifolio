/**
 * Test cases for uploading files to an item.
 */

import { it, describe, beforeEach, expect } from 'vitest';
import genTokenTests from '../tokenCase';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import itemId from '$lib/itemId';
import { payload } from '$endpoints/fetch';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it('Creates the file', async () => {
    await expect(
      api
        .item(itemId.ROOT)
        .file('example.md')
        .post(payload.file(await fromFileSystem('README.md'))),
    ).resolves.toStrictEqual({});
  });
});

describe('400', () => {
  it('Errors if the file already exists', async () => {
    await api
      .item(itemId.ROOT)
      .file('example.md')
      .post(payload.file(await fromFileSystem('README.md')));

    await expect(
      api
        .item(itemId.ROOT)
        .file('example.md')
        .post(payload.file(await fromFileSystem('README.md'))),
    ).rejects.toMatchObject({ code: 400 });
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    async api => api
      .item(itemId.ROOT)
      .file('example.md')
      .post(payload.file(await fromFileSystem('README.md'))),
  );
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(
      api
        .item(itemId.fromStr('/invalid'))
        .file('example.md')
        .post(payload.file(await fromFileSystem('README.md'))),
    ).rejects.toMatchObject({ code: 404 });
  });
});
