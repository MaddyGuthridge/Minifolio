/**
 * Test cases for updating item info
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { makeItemInfo, setup } from '../helpers';
import genTokenTests from '../tokenCase';
import { invalidColors, invalidNames, validColors, validNames } from '../consts';

let api: ApiClient;
const itemId = ['item'];

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(itemId).info.post('My item');
});

describe('Success', () => {
  it('Successfully updates item info', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo()))
      .resolves.toStrictEqual({});
    // Info has been updated
    await expect(api.item(itemId).info.get())
      .resolves.toStrictEqual(makeItemInfo());
  });

  it.each(validNames)('Accepts valid item names ($case)', async ({ name }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ name })))
      .resolves.toStrictEqual({});
  });

  it.each(validNames)('Accepts valid item short names ($case)', async ({ name }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ shortName: name })))
      .resolves.toStrictEqual({});
  });

  it.each(validColors)('Accepts valid colors ($case)', async ({ color }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ color })))
      .resolves.toStrictEqual({});
  });

  it.todo('Accepts valid icon images');
  it.todo('Accepts valid banner images');

  it('Accepts valid children', async () => {
    await expect(api.item([]).info.put(makeItemInfo({
      children: [itemId.at(-1)!]
    })))
      .resolves.toStrictEqual({});
  });

  it('Accepts valid filter items', async () => {
    await expect(api.item([]).info.put(makeItemInfo({
      filters: [itemId],
    })))
      .resolves.toStrictEqual({});
  });

  describe('Sections', () => {
    it('Accepts valid website info', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'site',
            label: 'Visit the website',
            url: 'https://example.com',
          }
        ]
      });
      await expect(api.item(itemId).info.put(info))
        .resolves.toStrictEqual({});
    });
    it('Accepts valid repo info', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'repo',
            label: 'Check out the code',
            info: {
              provider: 'github',
              path: 'MaddyGuthridge/Minifolio',
            }
          }
        ]
      });
      await expect(api.item(itemId).info.put(info))
        .resolves.toStrictEqual({});
    });
    it('Accepts valid package info', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'package',
            title: 'Install the app',
            info: {
              provider: 'npm',
              id: 'everything',
            }
          }
        ]
      });
      await expect(api.item(itemId).info.put(info))
        .resolves.toStrictEqual({});
    });

    it('Accepts valid links to other items', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'links',
            style: 'chip',
            label: 'See also',
            items: [
              // Root
              [],
            ]
          }
        ]
      });

      await expect(api.item(itemId).info.put(info))
        .resolves.toStrictEqual({});
    });
  });

});

describe('400', () => {
  it.each(invalidNames)('Rejects invalid item names ($case)', async ({ name }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ name })))
      .rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidNames)('Rejects invalid item short names ($case)', async ({ name }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ shortName: name })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-existent item icons', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({ icon: 'nope.jpg' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-existent item banners', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({ banner: 'nope.jpg' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-image item icons', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({ icon: 'info.json' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-image item banners', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({ banner: 'info.json' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidColors)('Rejects invalid item colors ($case)', async ({ color }) => {
    await expect(api.item(itemId).info.put(makeItemInfo({ color })))
      .rejects.toMatchObject({ code: 400 });
  });

  describe('Section data', () => {
    it('Rejects unrecognized item sections', async () => {
      const info = makeItemInfo({
        sections: [
          // Intentionally incorrect 'type' field
          {
            type: 'unknown',
            title: 'Title',
          } as any
          //   ^^^ needed or TypeScript will (correctly) identify that this is wrong
        ]
      });
      await expect(api.item(itemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it.each(invalidNames)('Rejects sections with invalid titles ($case)', async ({ name }) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'site',
            label: name,
            url: 'https://example.com',
          }
        ]
      })
      await expect(api.item(itemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it('Rejects link sections with links to invalid items', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'links',
            style: 'chip',
            label: 'See also',
            items: [
              ['invalid'],
            ]
          }
        ]
      });

      await expect(api.item(itemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it('Rejects link sections with self-referencing links', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'links',
            style: 'chip',
            label: 'See also',
            items: [
              itemId,
            ]
          }
        ]
      });

      await expect(api.item(itemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });
  });

  it('Rejects if listed child does not exist', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({ children: ['invalid'] })))
      .rejects.toMatchObject({ code: 400 });
  });

  describe('Filter items', () => {
    test('Item does not exist', async () => {
      await expect(api.item(itemId).info.put(makeItemInfo({
        filters: [
          ['invalid', 'item'],
        ]
      })))
        .rejects.toMatchObject({ code: 400 });
    });

    test('Self-referencing item', async () => {
      const info = makeItemInfo({
        filters: [
          itemId
        ]
      });

      await expect(api.item(itemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });
  });

  it('Rejects empty string SEO description', async () => {
    await expect(api.item(itemId).info.put(makeItemInfo({
      seo: {
        description: '',
        keywords: [],
      }
    }))).rejects.toMatchObject({ code: 400 });
  });
});

describe('401', () => {
  genTokenTests(
    () => api,
    api => api.item(itemId).info.put(makeItemInfo()),
  );
});

describe('404', () => {
  it('Rejects if item does not exist', async () => {
    await expect(api.item(['invalid']).info.put(makeItemInfo()))
      .rejects.toMatchObject({ code: 404 });
  });
});
