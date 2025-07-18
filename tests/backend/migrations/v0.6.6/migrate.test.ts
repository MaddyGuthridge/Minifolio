import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
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

  it('Correctly creates all items', async () => {
    const rootInfo = await api.item(itemId.ROOT).info.get();
    expect(rootInfo).toMatchObject({ children: ['group'] });
    // All required fields should be present in all items
    await validateItemInfo(itemId.ROOT, rootInfo);

    const childId = itemId.fromStr('/group');
    const child = await api.item(childId).info.get();
    expect(child).toMatchObject({
      // Only listed child is included
      children: ['listed'],
    });
    await validateItemInfo(childId, child);

    const grandchild1Id = itemId.fromStr('/group/listed');
    const grandchild2Id = itemId.fromStr('/group/unlisted');
    // Both grandchildren have valid data
    await validateItemInfo(grandchild1Id, await api.item(grandchild1Id).info.get());
    await validateItemInfo(grandchild2Id, await api.item(grandchild2Id).info.get());
    // Both children resolve
    await expect(api.item(grandchild1Id).info.get()).toResolve();
    await expect(api.item(grandchild2Id).info.get()).toResolve();
  });

  it('Migrates URL sections correctly', async () => {
    await expect(api.item(itemId.fromStr('/group/listed')).info.get()).resolves.toMatchObject({
      sections: expect.arrayContaining([
        {
          type: 'site',
          url: 'https://example.com',
          // Uses default icon and label
          icon: null,
          label: null,
        },
      ]),
    });
  });

  it('Migrates link sections correctly', async () => {
    await expect(api.item(itemId.fromStr('/group/listed')).info.get()).resolves.toMatchObject({
      sections: expect.arrayContaining([
        {
          type: 'links',
          label: 'See also',
          items: ['/group/unlisted'],
          style: 'card',
        },
      ]),
    });
  });
});

it('Migrates private data correctly', async () => {
  await migratePrivateDataFromZip(path.join(__dirname, 'private_data.zip'));
  // We can still log in
  await expect(api.admin.auth.login('maddy', 'Maddy123#')).toResolve();
});
