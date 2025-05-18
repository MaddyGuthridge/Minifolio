import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { setup } from '../../helpers';
import { migrateDataFromZip, migratePrivateDataFromZip } from '../migration';
import path from 'node:path';
import itemId from '$lib/itemId';
import { validateItemInfo } from '$lib/server/data/item';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

describe('Public data', () => {
  beforeEach(async () => {
    await migrateDataFromZip(path.join(__dirname, 'data.zip'));
  });

  test.each([
    itemId.ROOT,
    itemId.fromStr('/child'),
  ])('Items match validation (%s)', async (itemId) => {
    const info = await api.item(itemId).info.get();
    await validateItemInfo(itemId, info);
  });

  test('Verification info is displayed correctly', async () => {
    await expect(api.config.get()).resolves.toMatchObject({
      verification: {
        relMe: ['https://social.example.com/@someone'],
        atProtocol: null,
      }
    });
  });

  test('Items have their readme field set', async () => {
    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({
      readme: 'README.md',
    });

    await expect(api.item(itemId.fromStr('/child')).info.get()).resolves.toMatchObject({
      readme: 'README.md',
    });
  });
});

it('Migrates private data correctly', async () => {
  await migratePrivateDataFromZip(path.join(__dirname, 'private_data.zip'));
  // We can still log in
  await expect(api.admin.auth.login('admin', 'abc123ABC!')).toResolve();
});
