/**
 * Test cases for uploading files to an item.
 */
import { it, describe, beforeEach, expect } from 'vitest';
import type { ApiClient } from '$endpoints';
import { makeItemInfo, setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import genTokenTests from '../tokenCase';
import itemId from '$lib/itemId';
import { setItemInfo } from '$lib/server/data/item';
import { payload } from '$endpoints/fetch';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api
    .item(itemId.ROOT)
    .file('example.md')
    .post(payload.file(await fromFileSystem('README.md')));
});

describe('Success', () => {
  it('Deletes the file', async () => {
    await expect(api.item(itemId.ROOT).file('example.md').delete())
      .resolves.toStrictEqual({});
    // Now requesting the file should give a 404
    await expect(api.item(itemId.ROOT).file('example.md').get().text())
      .rejects.toMatchObject({ code: 404 });
  });

  it('Allows README.md to be deleted if it is no-longer the chosen readme file', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({ readme: null }));
    // Now deleting the readme should resolve
    await expect(api.item(itemId.ROOT).file('README.md').delete())
      .resolves.toStrictEqual({});
  });
});

describe('400', () => {
  it('Rejects requests to delete the readme file', async () => {
    await expect(api.item(itemId.ROOT).file('README.md').delete())
      .rejects.toMatchObject({ code: 400 });
  });

  it.each([
    { field: 'icon' },
    { field: 'banner' },
  ])('Rejects requests to delete $field image files', async ({ field }) => {
    await api.item(itemId.ROOT).file('image.png')
      .post(payload.file(await fromFileSystem('static/minifolio.png')));
    // Update info to make `image.png` be the chosen file for the given field
    const info = makeItemInfo({
      [field]: 'image.png',
    });
    await setItemInfo(itemId.ROOT, info);
    // Now, deleting the file should fail
    await expect(api.item(itemId.ROOT).file('image.png').delete())
      .rejects.toMatchObject({ code: 400 });
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
    await expect(api.item(itemId.fromStr('/invalid')).file('example.md').delete())
      .rejects.toMatchObject({ code: 404 });
  });
  it('Errors if the file does not exist', async () => {
    await expect(api.item(itemId.ROOT).file('invalid').delete())
      .rejects.toMatchObject({ code: 404 });
  });
});
