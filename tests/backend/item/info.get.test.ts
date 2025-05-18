/**
 * Test cases for getting item info
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import itemId from '$lib/itemId';
import { validateItemInfo } from '$lib/server/data/item';

let api: ApiClient;
const id = itemId.fromStr('/item');

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(id).info.post('My item');
});

describe('Success', () => {
  it('Correctly returns info', async () => {
    const itemInfo = await api.item(id).info.get();
    await validateItemInfo(id, itemInfo);
  });
});

describe('400', () => {
  it('Gives an error if data is not set up', async () => {
    await api.debug.clear();
    await expect(api.item(itemId.ROOT).info.get()).rejects.toMatchObject({ code: 400 });
  });
});

describe('404', () => {
  it("Rejects when an item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('/invalid')).info.get())
      .rejects.toMatchObject({ code: 404 });
  });
});
