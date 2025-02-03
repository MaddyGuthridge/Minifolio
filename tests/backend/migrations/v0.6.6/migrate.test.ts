import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../../helpers';
import { migrateDataFromZip, migratePrivateDataFromZip } from '../migration';
import path from 'path';
import itemId from '$lib/itemId';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

describe('Public data', () => {
  beforeEach(async () => {
    await migrateDataFromZip(path.join(__dirname, 'data.zip'));
  });

  it('Correctly creates all items', async () => {
    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({
      children: ['group']
    });

    await expect(api.item(itemId.fromStr('/group')).info.get()).resolves.toMatchObject({
      // Only listed child is listed
      children: ['listed']
    });

    // Both children resolve
    await expect(api.item(itemId.fromStr('/group/listed')).info.get()).toResolve();
    await expect(api.item(itemId.fromStr('/group/unlisted')).info.get()).toResolve();
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
      ])
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
      ])
    });
  });
});

it('Migrates private data correctly', async () => {
  await migratePrivateDataFromZip(path.join(__dirname, 'private_data.zip'));
  // We can still log in
  await expect(api.admin.auth.login('maddy', 'Maddy123#')).toResolve();
});
