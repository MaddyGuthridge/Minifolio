/**
 * Test cases for creating new items
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';
import { invalidIds, invalidNames, validIds, validNames } from '../consts';
import { assert } from 'superstruct'
import { ItemInfoStruct } from '$lib/server/data/item';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it.each(validIds)('Allows valid IDs ($case)', async ({ id }) => {
    await expect(api.item([id]).info.post('My item')).toResolve();
  });

  it.each(validNames)('Allows valid item names ($case)', async ({ name }) => {
    await expect(api.item(['item']).info.post(name)).toResolve();
  });

  it("Returns the new item's `info.json`", async () => {
    const info = await api.item(['item']).info.post('My item');
    // Returned info should validate as `ItemInfoStruct`
    // This doesn't check that the data is fully valid, but just that it has the right shape
    expect(() => assert(info, ItemInfoStruct)).not.toThrow();
  });

  it('Generates item with a valid `README.md`', async () => {
    await api.item(['item']).info.post('My item');
    await expect(api.item(['item']).readme.get()).resolves.toStrictEqual(expect.any(String));
  });

  it('Adds new items as children by default', async () => {
    await api.item(['item']).info.post('My item');
    // Parent item is `/` (root)
    await expect(api.item([]).info.get()).resolves.toMatchObject({
      children: ['item'],
    });
  });
});

describe('400', () => {
  it('Fails if the data is not set up', async () => {
    await api.debug.clear();
    await expect(api.item(['item']).info.get()).rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidIds)('Rejects invalid item IDs ($case)', async ({ id }) => {
    await expect(api.item([id]).info.post('My item')).rejects.toMatchObject({ code: 400 })
  });

  it('Rejects duplicate IDs', async () => {
    await api.item(['item']).info.post('My item');
    await expect(api.item(['item']).info.post('My item')).rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidNames)('Rejects invalid item names ($case)', async ({ name }) => {
    await expect(api.item(['item']).info.post(name)).rejects.toMatchObject({ code: 400 })
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    api => api.item(['my-item']).info.post('My item', ''),
  );
});

describe('404', () => {
  it("Rejects new items when the parent doesn't exist", async () => {
    await expect(api.item(['invalid', 'parent']).info.post('My item')).rejects.toMatchObject({ code: 404 });
  });
});
