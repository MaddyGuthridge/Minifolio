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

  test('Item matches validation', async () => {
    const info = await api.item(itemId.ROOT).info.get();
    await validateItemInfo(itemId.ROOT, info);
  });
});

it('Migrates private data correctly', async () => {
  await migratePrivateDataFromZip(path.join(__dirname, 'private_data.zip'));
  // We can still log in
  await expect(api.admin.auth.login('dev', 'abc123ABC!')).toResolve();
});
