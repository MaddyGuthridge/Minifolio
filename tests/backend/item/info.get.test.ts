/**
 * Test cases for getting item info
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import itemId from '$lib/itemId';

let api: ApiClient;
const id = itemId.fromStr('/item');

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(id).info.post('My item');
});

describe('Success', () => {
  it('Correctly returns info', async () => {
    await expect(api.item(id).info.get()).resolves.toStrictEqual({
      name: expect.any(String),
      shortName: null,
      description: '',
      color: expect.toSatisfy(c => /^#[0-9a-fA-F]{6}$/.test(c)),
      icon: null,
      banner: null,
      children: [],
      filters: [],
      sections: [],
      seo: {
        description: null,
        keywords: [expect.any(String)],
      },
    })
  });
});

describe('400', () => {
  it('Gives an error if data is not set up', async () => {
    await api.debug.clear();
    await expect(api.item(itemId.ROOT).info.get()).rejects.toMatchObject({ code: 400 });
  });
})

describe('404', () => {
  it("Rejects when an item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('/invalid')).info.get()).rejects.toMatchObject({ code: 404 });
  });
});
