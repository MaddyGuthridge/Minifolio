/**
 * Test cases for getting a file associated with an item.
 */

import { it, describe, beforeEach, expect } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import { readFile } from 'node:fs/promises';
import itemId from '$lib/itemId';
import { payload } from '$endpoints/fetch';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item(itemId.ROOT).file('example.md').post(payload.file(await fromFileSystem('README.md')));
});

describe('Success', () => {
  it('Returns the file', async () => {
    const content = await api.item(itemId.ROOT).file('example.md').get().text();
    expect(content).toStrictEqual(await readFile('README.md', { encoding: 'utf-8' }));
  });
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(api.item(itemId.fromStr('/invalid')).file('example.md').get().text())
      .rejects.toMatchObject({ code: 404 });
  });
  it('Errors if the file does not exist', async () => {
    await expect(api.item(itemId.ROOT).file('invalid').get().text())
      .rejects.toMatchObject({ code: 404 });
  });
});
