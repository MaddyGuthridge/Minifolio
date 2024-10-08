
import { describe, it, beforeEach, expect } from 'vitest';
import { makeItemInfo, makeGroup, makeItem, setup } from '../helpers';
import genRemoveTests from './removeCases';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';

describe('Generated test cases', () => {
  let api: ApiClient;

  genRemoveTests(
    // Setup
    async () => {
      api = (await setup()).api;
    },
    // Create group
    async (id: string) => {
      await api.group.withId(id).create('Group', '');
    },
    // Get group info
    (id) => api.group.withId(id).info.get(),
    // Delete group
    id => api.group.withId(id).remove(),
  );
});

describe('Other test cases', () => {
  let api: ApiClient;
  const group = 'my-group';

  beforeEach(async () => {
    api = (await setup()).api;
    await makeGroup(api, group);
  });

  genTokenTests(
    () => api,
    api => api.group.withId(group).remove(),
  );

  it('Removes links to items in the group', async () => {
    await makeItem(api, group, 'item-1');
    await makeGroup(api, 'group-2');
    await makeItem(api, 'group-2', 'item-2');
    // Create the link
    await api.group.withId('group-2').item.withId('item-2').links.create(group, 'item-1');
    // Removing group removes link from group-2/item-2
    await api.group.withId(group).remove();
    await expect(api.group.withId('group-2').item.withId('item-2').info.get())
      .resolves.toMatchObject({
        // Links were removed
        links: [],
      });
  });

  /** Edge case: one-way links can be created by setting group info manually */
  it('Removes one-way links to this item', async () => {
    await makeItem(api, group, 'item-1');
    await makeGroup(api, 'group-2');
    await makeItem(api, 'group-2', 'item-2');
    // Create the link
    await api.group.withId('group-2').item.withId('item-2').info.set(
      makeItemInfo({
        links: [[{ groupId: group, style: 'chip', title: group }, ['item-1']]],
      }),
    );
    // Removing group removes link from group-2/item-2
    await api.group.withId(group).remove();
    await expect(api.group.withId('group-2').item.withId('item-2').info.get())
      .resolves.toMatchObject({
        // Links were removed
        links: [],
      });
  });
});
