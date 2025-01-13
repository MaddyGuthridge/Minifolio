/**
 * Test cases for uploading files to an item.
 */
import { it, describe, beforeEach, expect } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import genTokenTests from '../tokenCase';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item([]).file('example.md').post(await fromFileSystem('README.md'));
});

describe('Success', () => {
  it('Deletes the file', async () => {
    await expect(api.item([]).file('example.md').delete())
      .resolves.toStrictEqual({});
    // Now requesting the file should give a 404
    await expect(api.item([]).file('example.md').get())
      .rejects.toMatchObject({ code: 404 });
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    async api => api.item([]).file('example.md').post(await fromFileSystem('README.md')),
  );
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(api.item(['invalid']).file('example.md').delete())
      .rejects.toMatchObject({ code: 404 });
  });
  it('Errors if the file does not exist', async () => {
    await expect(api.item([]).file('invalid').delete())
      .rejects.toMatchObject({ code: 404 });
  });
});
