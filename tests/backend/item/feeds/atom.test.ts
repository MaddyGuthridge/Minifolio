/**
 * Test cases for RSS feeds.
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeItemInfo, setup } from '../../helpers';
import itemId from '$lib/itemId';
import { getUrl } from '$endpoints/fetch';
import consts from '$lib/consts';
import { version } from '$app/environment';

const BASE_URL = getUrl();

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});

describe('Success', () => {
  it('Allows Atom feeds to be enabled', async () => {
    await expect(api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: true,
        },
      },
    }))).resolves.toStrictEqual({});
  });

  it('Gives correct data when visiting feed.atom', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: true,
        },
      },
    }));

    // Now fetch the feed
    await expect(api.item(itemId.ROOT).feeds.atom()).resolves.toStrictEqual({
      feed: {
        '@xmlns': 'http://www.w3.org/2005/Atom',
        link: [
          {
            '@href': `${BASE_URL}/feed.atom`,
            '@rel': 'self',
            '@type': consts.MIME_TYPES.ATOM,
          },
          {
            '@href': BASE_URL,
            '@rel': 'alternate',
            '@type': consts.MIME_TYPES.HTML,
          },
        ],
        generator: {
          '#': 'Minifolio',
          '@uri': consts.APP_DOCS,
          '@version': version,
        },
        id: BASE_URL,
        title: 'My blog',
        subtitle: 'View this item page in the portfolio',
        updated: expect.any(String),
      },
    });
  });

  it('Gives correct data when child elements are added', async () => {
    // Enable RSS
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: true,
        },
      },
    }));
    // Create posts
    await api.item(itemId.fromStr('/post1')).info.post('Post 1', 'Description');
    await api.item(itemId.fromStr('/post2')).info.post('Post 2', 'Description');

    await expect(api.item(itemId.ROOT).feeds.atom()).resolves.toStrictEqual({
      feed: {
        '@xmlns': 'http://www.w3.org/2005/Atom',
        link: [
          {
            '@href': `${BASE_URL}/feed.atom`,
            '@rel': 'self',
            '@type': consts.MIME_TYPES.ATOM,
          },
          {
            '@href': BASE_URL,
            '@rel': 'alternate',
            '@type': consts.MIME_TYPES.HTML,
          },
        ],
        generator: {
          '#': 'Minifolio',
          '@uri': consts.APP_DOCS,
          '@version': version,
        },
        id: BASE_URL,
        title: 'My blog',
        subtitle: 'View this item page in the portfolio',
        updated: expect.any(String),
        entry: [
          {
            id: `${BASE_URL}/post1`,
            published: expect.any(String),
            updated: expect.any(String),
            summary: 'Description',
            title: 'Post 1',
            link: {
              '@href': `${BASE_URL}/post1`,
              '@rel': 'alternate',
              '@type': consts.MIME_TYPES.HTML,
            },
          },
          {
            id: `${BASE_URL}/post2`,
            // Not bothering to test timestamps here
            published: expect.any(String),
            updated: expect.any(String),
            summary: 'Description',
            title: 'Post 2',
            link: {
              '@href': `${BASE_URL}/post2`,
              '@rel': 'alternate',
              '@type': consts.MIME_TYPES.HTML,
            },
          },
        ],
      },
    });
  });

  it('Excludes unlisted items', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: true,
        },
      },
    }));
    await api.item(itemId.fromStr('/post')).info.post('Post 1', 'Description');
    // Hide child post
    const info = await api.item(itemId.ROOT).info.get();
    await api.item(itemId.ROOT).info.put({ ...info, children: [] });

    // Now when we load the feed, there should be no items
    const atom = await api.item(itemId.ROOT).feeds.atom() as any;
    expect(atom.feed).not.toHaveProperty('entry');
  });

  it('Uses the SEO description of items, if they have one', async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: true,
        },
      },
    }));
    const childId = itemId.fromStr('/post1');
    await api.item(childId).info.post('Post 1', 'This description is not shown');
    await api.item(childId).info.put(makeItemInfo({
      seo: {
        description: 'This description is shown',
        keywords: [],
      },
    }));

    // Now load feed
    const atom = await api.item(itemId.ROOT).feeds.atom() as any;

    expect(atom.feed.entry.summary).toStrictEqual('This description is shown');
  });
});

describe('404', () => {
  it("Gives a 404 if feeds aren't enabled", async () => {
    await expect(api.item(itemId.ROOT).feeds.atom()).rejects.toMatchObject({ code: 404 });
  });

  it("Gives a 404 if Atom isn't enabled", async () => {
    await api.item(itemId.ROOT).info.put(makeItemInfo({
      feed: {
        title: 'My blog',
        providers: {
          atom: false,
        },
      },
    }));
    await expect(api.item(itemId.ROOT).feeds.atom()).rejects.toMatchObject({ code: 404 });
  });

  it("Gives a 404 if the item doesn't exist", async () => {
    await expect(api.item(itemId.fromStr('/child')).feeds.atom())
      .rejects.toMatchObject({ code: 404 });
  });
});
