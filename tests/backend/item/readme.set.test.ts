/**
 * Test cases for setting the README.md of an item.
 */

import apiClient, { type ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import genTokenTests from '../tokenCase';
import itemId from '$lib/itemId';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it('Correctly updates the README for the root item', async () => {
    await expect(api.item(itemId.ROOT).readme.put('New readme'))
      .resolves.toStrictEqual({});
    // Now when we request the README, it should have the new content
    await expect(api.item(itemId.ROOT).readme.get())
      .resolves.toStrictEqual('New readme');
  });
});

describe('400', () => {
  it('Errors if the server has not been set up', async () => {
    await apiClient().debug.clear();
    await expect(apiClient().item(itemId.ROOT).readme.put('New readme'))
      .rejects.toMatchObject({ code: 400 });
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    api => api.item(itemId.ROOT).readme.put('Hi'),
  );
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(api.item(itemId.fromStr('/invalid/item')).readme.put('New readme'))
      .rejects.toMatchObject({ code: 404 });
  });
});
