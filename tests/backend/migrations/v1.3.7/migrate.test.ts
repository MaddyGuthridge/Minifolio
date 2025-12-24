import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, test } from 'vitest';
import { setup } from '../../helpers';
import { migrateDataFromZip } from '../migration';
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
    expect(info.author).toMatchObject({
      fediverse: null,
    });
  });
});
