/**
 * Test cases for deleting items.
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeItemInfo, setup } from '../helpers';
import genTokenTests from '../tokenCase';
import itemId from '$lib/itemId';

let api: ApiClient;
const child = itemId.fromStr('/item');

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(child).info.post('My item');
});

describe('Success', () => {
  it('Successfully deletes items', async () => {
    await expect(api.item(child).info.delete())
      .resolves.toStrictEqual({});

    // Expect item not found error
    await expect(api.item(child).info.get())
      .rejects.toMatchObject({ code: 404 });
  });

  it('Removes child items', async () => {
    const grandchild = itemId.child(child, 'grandchild');
    await api.item(grandchild).info.post('Grandchild');
    await expect(api.item(child).info.delete())
      .resolves.toStrictEqual({});
    // Grandchild also deleted
    await expect(api.item(grandchild).info.get())
      .rejects.toMatchObject({ code: 404 });
  });

  it('Removes links to this item', async () => {
    const other = itemId.fromStr('/other');
    await api.item(other).info.post('Other item');

    await api.item(other).info.put(makeItemInfo({
      sections: [
        {
          type: 'links',
          label: 'See also',
          style: 'chip',
          items: [child],
        },
      ],
    }));

    await api.item(child).info.delete();

    // Other item info should have link to this item removed
    await expect(api.item(other).info.get()).resolves.toMatchObject({
      sections: [
        expect.objectContaining({
          items: [],
          //     ^^^
          //     Gone
        }),
      ],
    });
  });

  it('Removes links to child items', async () => {
    const grandchild = itemId.child(child, 'grandchild');
    await api.item(grandchild).info.post('Grandchild');
    const other = itemId.fromStr('/other');
    await api.item(other).info.post('Other item');

    await api.item(other).info.put(makeItemInfo({
      sections: [
        {
          type: 'links',
          label: 'See also',
          style: 'chip',
          items: [grandchild],
          // Link to grandchild
        },
      ],
    }));
    await api.item(child).info.delete();

    // Link to grandchild should be broken by deletion of child
    await expect(api.item(other).info.get()).resolves.toMatchObject({
      sections: [
        expect.objectContaining({
          items: [],
          //     ^^^
          //     Gone
        }),
      ],
    });
  });

  it('Removes this item from the children of its parent', async () => {
    await api.item(child).info.delete();

    // Should be gone from root item
    await expect(api.item(itemId.ROOT).info.get()).resolves.toMatchObject({
      children: [],
    });
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    api => api.item(child).info.delete(),
  );
});

describe('403', () => {
  it('Blocks deletion of the root item', async () => {
    await expect(api.item(itemId.ROOT).info.delete())
      .rejects.toMatchObject({ code: 403 });
  });
});

describe('404', () => {
  it("Rejects if item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('invalid')).info.delete())
      .rejects.toMatchObject({ code: 404 });
  });
});
