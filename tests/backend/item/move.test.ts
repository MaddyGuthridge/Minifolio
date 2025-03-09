/**
 * Test cases for moving an item
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { makeItemInfo, setup } from '../helpers';
import itemId from '$lib/itemId';

let api: ApiClient;
const id1 = itemId.fromStr('/item1');
const id2 = itemId.fromStr('/item2');
const target = itemId.child(id2, 'item1');

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(id1).info.post('Item 1');
  await api.item(id2).info.post('Item 2');
});

describe('Success', () => {
  it('Moves the item to the desired location', async () => {
    await expect(api.item(id1).info.move(target)).resolves.toStrictEqual({});

    // Item now exists
    await expect(api.item(target).info.get()).toResolve();
    // And doesn't exist at old location
    await expect(api.item(id1).info.get()).rejects.toMatchObject({ code: 404 });
  });

  it('Also moves children', async () => {
    await api.item(itemId.child(id1, 'child')).info.post('Child item');
    await api.item(id1).info.move(target);

    // Child exists in new location
    await expect(api.item(itemId.child(target, 'child')).info.get()).toResolve();
  });

  it('Updates links to the moved items', async () => {
    // Link root to item1
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      sections: [{
        type: 'links',
        label: 'See also',
        style: 'chip',
        items: [id1],
      }],
    }));

    await api.item(id1).info.move(target);

    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({
      sections: [{
        type: 'links',
        label: 'See also',
        style: 'chip',
        items: [target],
      }],
    });
  });

  it('Updates links to children of the moved items', async () => {
    const child = itemId.child(id1, 'child');
    const childTarget = itemId.child(target, 'child');
    await api.item(child).info.post('Child item');
    // Link to child item
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      sections: [{
        type: 'links',
        label: 'See also',
        style: 'chip',
        items: [child],
      }],
    }));
    await api.item(id1).info.move(target);
    // Link now points to child's new location
    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({
      sections: [{
        type: 'links',
        label: 'See also',
        style: 'chip',
        items: [childTarget],
      }],
    });
  });

  test('Listed items are listed in their new locations', async () => {
    await expect(api.item(id1).info.move(target)).resolves.toStrictEqual({});

    // Should be a child of item2
    await expect(api.item(id2).info.get()).resolves.toMatchObject({ children: ['item1'] });
  });

  test('Listed items are removed from the listed children in their old locations', async () => {
    await expect(api.item(id1).info.move(target)).resolves.toStrictEqual({});

    // Should not be a child of root
    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({ children: ['item2'] });

  });

  test('Unlisted items are unlisted in their new locations', async () => {
    // Make item unlisted
    await api.item(itemId.ROOT).info.put(makeItemInfo({ children: [] }));
    // Move item
    await expect(api.item(id1).info.move(target)).resolves.toStrictEqual({});
    // Should not be a listed child of item2
    await expect(api.item(id2).info.get()).resolves.toMatchObject({ children: [] });
  });
});

describe('400', () => {
  it('Rejects attempts to move an item to its children', async () => {
    await expect(api.item(itemId.ROOT).info.move(id1)).rejects.toMatchObject({ code: 400 });
  });

  it("Rejects attempts to move an item if the target's parent does not exist", async () => {
    await expect(api.item(id1).info.move(itemId.child(target, 'child')))
      .rejects.toMatchObject({ code: 400 });
  });
});

describe('404', () => {
  it("Rejects when an item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('/invalid')).info.move(target))
      .rejects.toMatchObject({ code: 404 });
  });
});
