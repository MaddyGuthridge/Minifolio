
import { beforeEach, describe, expect, it, test } from 'vitest';
import { makeGroup, setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import type { ItemInfoFull } from '$lib/server/data/itemOld';
import genCreationTests from '../creationCases';
import genTokenTests from '../../tokenCase';

// Generate repeated test cases between groups and items
describe('Generated test cases', () => {
  let api: ApiClient;
  const groupId = 'group-id';

  genCreationTests(
    'item',
    async () => {
      api = (await setup()).api;
      await api.group.withId(groupId).create('Group', '');
    },
    async (id: string, name: string, description: string) => {
      await api.group.withId(groupId).item.withId(id).create(name, description);
    }
  );
});

describe('Sets up basic item properties', () => {
  let api: ApiClient;
  const groupId = 'group';

  beforeEach(async () => {
    api = (await setup()).api;
    await makeGroup(api, groupId);
  });
  const itemId = 'my-item';
  let info: ItemInfoFull;
  beforeEach(async () => {
    await api.group.withId(groupId).item.withId(itemId).create('Item name', 'Item description');
    info = await api.group.withId(groupId).item.withId(itemId).info.get();
  });

  test('Name matches', () => {
    expect(info.name).toStrictEqual('Item name');
  });

  test('Description matches', () => {
    expect(info.description).toStrictEqual('Item description');
  });

  it('Chooses a random color for the item', () => {
    expect(info.color).toSatisfy((s: string) => /^#[0-9a-f]{6}$/.test(s));
  });
});

describe('Other test cases', () => {
  let api: ApiClient;
  const groupId = 'group';

  beforeEach(async () => {
    api = (await setup()).api;
    await makeGroup(api, groupId);
  });

  it("Fails if the group doesn't exist", async () => {
    await expect(api.group.withId('invalid').item.withId('item-id').create('My item', ''))
      .rejects.toMatchObject({ code: 404 });
  });

  test('New items are listed in their group by default', async () => {
    await api.group.withId(groupId).item.withId('item-id').create('Item name', 'Item description');
    // Item should be listed
    await expect(api.group.withId(groupId).info.get()).resolves.toMatchObject({
      listedItems: ['item-id'],
    });
  });

  test('New items are used as filters by their group by default', async () => {
    await api.group.withId(groupId).item.withId('item-id').create('Item name', 'Item description');
    // Item should be listed
    await expect(api.group.withId(groupId).info.get()).resolves.toMatchObject({
      filterItems: ['item-id'],
    });
  });

  genTokenTests(
    () => api,
    api => api.group.withId(groupId).item.withId('item-id').create('My item', ''),
  );
});
