/**
 * Test cases for getting the README.md of an item.
 */

import apiClient, { type ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it('Correctly returns the README for the root item', async () => {
    await expect(api.item('/').readme.get())
      .resolves.toStrictEqual(expect.any(String));
  })
});

describe('400', () => {
  it('Errors if the server has not been set up', async () => {
    await apiClient().debug.clear();
    await expect(apiClient().item('/').readme.get())
      .rejects.toMatchObject({ code: 400 });
  });
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(api.item('/invalid/item').readme.get())
      .rejects.toMatchObject({ code: 404 });
  });
});
