/**
 * Test cases for sitemap.xml generation
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, expect, it } from 'vitest';
import { setup } from './helpers';
import itemId from '$lib/itemId';
import { getUrl } from '$endpoints/fetch';

const BASE_URL = getUrl();

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});


it('Generates a basic sitemap for an empty site', async () => {
  await expect(api.sitemap()).resolves.toStrictEqual({
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      url: {
        loc: `${BASE_URL}/`
      }
    }
  });
});

it('Includes children in sitemap', async () => {
  await api.item(itemId.fromStr('/child')).info.post('Child item');
  await expect(api.sitemap()).resolves.toStrictEqual({
    urlset: {
      '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      url: [
        {
          loc: `${BASE_URL}/`,
        },
        {
          loc: `${BASE_URL}/child`,
        },
      ]
    }
  });
});
