/**
 * Test cases for updating item info
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { makeItemInfo, setup } from '../helpers';
import genTokenTests from '../tokenCase';
import { invalidColors, invalidNames, invalidUrls, validColors, validNames, validUrls } from '../consts';
import itemId from '$lib/itemId';
import { payload } from '$endpoints/fetch';
import fromFileSystem from '../fileRequest';
import type { RepoInfo } from '$lib/server/data/item/repo';
import type { PackageInfo } from '$lib/server/data/item/package';

let api: ApiClient;
const childItemId = itemId.fromStr('/item');

beforeEach(async () => {
  api = (await setup()).api;
  await api.item(childItemId).info.post('My item');
});

describe('Success', () => {
  it('Successfully updates item info', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo()))
      .resolves.toStrictEqual({});
    // Info has been updated
    await expect(api.item(childItemId).info.get())
      .resolves.toStrictEqual(makeItemInfo({ timeCreated: expect.any(Number), timeEdited: expect.any(Number) }));
  });

  it.each(validNames)('Accepts valid item names ($case)', async ({ name }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ name })))
      .resolves.toStrictEqual({});
  });

  it.each(validNames)('Accepts valid item short names ($case)', async ({ name }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ shortName: name })))
      .resolves.toStrictEqual({});
  });

  it.each(validColors)('Accepts valid colors ($case)', async ({ color }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ color })))
      .resolves.toStrictEqual({});
  });

  it.each([
    { field: 'icon' },
    { field: 'banner' },
  ])('Accepts valid images for $field field', async ({ field }) => {
    // Upload an image
    await api
      .item(childItemId)
      .file('image.png')
      .post(payload.file(await fromFileSystem('static/minifolio.png')));

    await expect(api.item(childItemId).info.put(makeItemInfo({ [field]: 'image.png' })))
      .resolves.toStrictEqual({});
  });

  it('Accepts valid children', async () => {
    await expect(api.item(itemId.ROOT).info.put(makeItemInfo({
      children: [itemId.suffix(childItemId)]
    })))
      .resolves.toStrictEqual({});
  });

  it('Accepts valid filter items', async () => {
    await expect(api.item(itemId.ROOT).info.put(makeItemInfo({
      filters: [childItemId],
    })))
      .resolves.toStrictEqual({});
  });

  describe('Sections', () => {
    it.each(validUrls)('Accepts valid website info', async ({ url }) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'site',
            icon: null,
            label: 'Visit the website',
            url,
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
        .resolves.toStrictEqual({});
    });
    it.each<RepoInfo>([
      { provider: 'github', path: 'MaddyGuthridge/Minifolio' },
      {
        provider: 'custom',
        icon: 'lab la-github',
        title: 'Manual link to GitHub',
        subtitle: '',
        url: 'https://github.com/MaddyGuthridge/Minifolio'
      },
    ])('Accepts valid repo info', async (repoInfo) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'repo',
            label: 'Check out the code',
            info: repoInfo,
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
        .resolves.toStrictEqual({});
    });
    it.each<PackageInfo>([
      { provider: 'npm', id: 'jsc-compiler' },
      { provider: 'pypi', id: 'pyhtml-enhanced' },
      { provider: 'docker', id: 'maddyguthridge/minifolio' },
      {
        provider: 'custom',
        providerName: 'Custom provider',
        command: 'dnf install cowsay',
        icon: 'lab la-fedora',
        url: 'https://packages.fedoraproject.org/pkgs/cowsay/cowsay/',
      },
    ])('Accepts valid package info', async (packageInfo) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'package',
            label: 'Install the app',
            info: packageInfo,
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
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
              itemId.ROOT,
            ]
          }
        ]
      });

      await expect(api.item(childItemId).info.put(info))
        .resolves.toStrictEqual({});
    });
  });

});

describe('400', () => {
  it.each(invalidNames)('Rejects invalid item names ($case)', async ({ name }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ name })))
      .rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidNames)('Rejects invalid item short names ($case)', async ({ name }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ shortName: name })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-existent item icons', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ icon: 'nope.jpg' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-existent item banners', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ banner: 'nope.jpg' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-image item icons', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ icon: 'info.json' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it('Rejects non-image item banners', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ banner: 'info.json' })))
      .rejects.toMatchObject({ code: 400 });
  });

  it.each(invalidColors)('Rejects invalid item colors ($case)', async ({ color }) => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ color })))
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
      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it.each(invalidNames)('Rejects sections with invalid titles ($case)', async ({ name }) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'site',
            icon: null,
            label: name,
            url: 'https://example.com',
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it.each(invalidUrls)('Rejects site sections with invalid URLs ($case)', async ({ url }) => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'site',
            icon: null,
            label: 'Label',
            url,
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it('Rejects repo sections with unknown repo providers', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'repo',
            label: 'View the code',
            info: {
              // Intentionally work around TypeScript error
              //                 vvvvvvv
              provider: 'invalid' as any,
              path: 'MaddyGuthridge/Minifolio',
            }
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });

    it('Rejects package sections with unknown package providers', async () => {
      const info = makeItemInfo({
        sections: [
          {
            type: 'package',
            label: 'Install the code',
            info: {
              // Intentionally work around TypeScript error
              //                 vvvvvvv
              provider: 'invalid' as any,
              id: 'MaddyGuthridge/Minifolio',
            }
          }
        ]
      });
      await expect(api.item(childItemId).info.put(info))
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
              itemId.fromStr('/invalid'),
            ]
          }
        ]
      });

      await expect(api.item(childItemId).info.put(info))
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
              childItemId,
            ]
          }
        ]
      });

      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });
  });

  it('Rejects if listed child does not exist', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({ children: ['invalid'] })))
      .rejects.toMatchObject({ code: 400 });
  });

  describe('Filter items', () => {
    test('Item does not exist', async () => {
      await expect(api.item(childItemId).info.put(makeItemInfo({
        filters: [
          itemId.fromStr('/invalid/item'),
        ]
      })))
        .rejects.toMatchObject({ code: 400 });
    });

    test('Self-referencing item', async () => {
      const info = makeItemInfo({
        filters: [
          childItemId
        ]
      });

      await expect(api.item(childItemId).info.put(info))
        .rejects.toMatchObject({ code: 400 });
    });
  });

  it('Rejects empty string SEO description', async () => {
    await expect(api.item(childItemId).info.put(makeItemInfo({
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
    api => api.item(childItemId).info.put(makeItemInfo()),
  );
});

describe('404', () => {
  it('Rejects if item does not exist', async () => {
    await expect(api.item(itemId.fromStr('/invalid')).info.put(makeItemInfo()))
      .rejects.toMatchObject({ code: 404 });
  });
});
