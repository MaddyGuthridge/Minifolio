/**
 * Test cases for RSS feeds.
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeItemInfo, setup } from '../../helpers';
import itemId from '$lib/itemId';
import { getUrl } from '$endpoints/fetch';

const BASE_URL = getUrl();

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it('Allows RSS feeds to be enabled', async () => {
    await expect(api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          rss: true,
          atom: false,
        },
      },
    }))).resolves.toStrictEqual({});
  });

  it('Gives correct data when visiting rss.xml', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          rss: true,
          atom: false,
        },
      },
    }));

    // Now fetch the feed
    await expect(api.item(itemId.ROOT).feeds.rss()).resolves.toStrictEqual({
      rss: {
        '@version': '2.0',
        '@xmlns:atom': 'http://www.w3.org/2005/Atom',
        channel: {
          'atom:link': {
            '@href': `${BASE_URL}/rss.xml`,
            '@rel': 'self',
            '@type': 'application/rss+xml',
          },
          description: 'Item description',
          generator: 'Minifolio',
          link: BASE_URL,
          title: 'My blog',
        },
      }
    });
  });

  it('Gives correct data when child elements are added', async () => {
    // Enable RSS
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          rss: true,
          atom: false,
        },
      },
    }));
    // Create posts
    await api.item(itemId.fromStr('/post1')).info.post('Post 1', 'Description');
    await api.item(itemId.fromStr('/post2')).info.post('Post 2', 'Description');


    await expect(api.item(itemId.ROOT).feeds.rss()).resolves.toStrictEqual({
      rss: {
        '@version': '2.0',
        '@xmlns:atom': 'http://www.w3.org/2005/Atom',
        channel: {
          'atom:link': {
            '@href': `${BASE_URL}/rss.xml`,
            '@rel': 'self',
            '@type': 'application/rss+xml',
          },
          description: 'Item description',
          generator: 'Minifolio',
          link: BASE_URL,
          title: 'My blog',
          item: [
            {
              title: 'Post 1',
              description: 'Description',
              guid: {
                '#': `${BASE_URL}/post1`,
                '@isPermaLink': 'true',
              },
              link: `${BASE_URL}/post1`,
              pubDate: new Date().toUTCString(),
            },
            {
              title: 'Post 2',
              description: 'Description',
              guid: {
                '#': `${BASE_URL}/post2`,
                '@isPermaLink': 'true',
              },
              link: `${BASE_URL}/post2`,
              pubDate: new Date().toUTCString(),
            },
          ],
        },
      }
    });
  });

  it('Excludes unlisted items', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          rss: true,
          atom: false,
        },
      },
    }));
    await api.item(itemId.fromStr('/post')).info.post('Post 1', 'Description');
    // Hide child post
    const info = await api.item(itemId.ROOT).info.get();
    await api.item(itemId.ROOT).info.put({ ...info, children: [] });

    // Now when we load the feed, there should be no items
    const feed = await api.item(itemId.ROOT).feeds.rss() as any;
    expect(feed.rss.channel).not.toHaveProperty('item');
  });
});

describe('404', () => {
  it("Gives a 404 if feeds aren't enabled", async () => {
    await expect(api.item(itemId.ROOT).feeds.rss()).rejects.toMatchObject({ code: 404 });
  });

  it("Gives a 404 if RSS isn't enabled", async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          rss: false,
          atom: false,
        },
      },
    }));
    await expect(api.item(itemId.ROOT).feeds.rss()).rejects.toMatchObject({ code: 404 });
  });

  it("Gives a 404 if the item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('/child')).feeds.rss())
      .rejects.toMatchObject({ code: 404 });
  });
});
