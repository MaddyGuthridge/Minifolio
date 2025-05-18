import itemId, { type ItemId } from '$lib/itemId';
import consts from '$lib/consts';
import { getItemInfo, itemExists } from '$lib/server/data/item';
import { itemFileUrl } from '$lib/urls';
import { error } from '@sveltejs/kit';
import { create } from 'xmlbuilder2';
import type { AuthorInfo } from '$lib/server/data/item/item';
import { dev, version } from '$app/environment';
import { getConfig } from '$lib/server/data/config';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { unixTime, unixToIsoTime } from '$lib/util';

type Request = import('./$types').RequestEvent;


/**
 * Get the current value of the RSS feed for this item.
 *
 * Based on information and documentation from:
 *
 * - https://www.rfc-editor.org/rfc/rfc4287
 * - https://kevincox.ca/2022/05/06/rss-feed-best-practices/
 * - https://validator.w3.org/feed/docs/atom.html
 * - https://www.ibm.com/docs/en/baw/22.0.x?topic=formats-atom-feed-format
 */
export async function GET(req: Request) {
  const item = itemId.validate(`/${req.params.item}`);

  // Give a 404 if:
  // 1. Item doesn't exist
  if (!await itemExists(item)) {
    error(404, `Item ${item} does not exist`);
  }
  const info = await getItemInfo(item);
  // 2. Item is not a feed
  if (info.feed === null) {
    error(404, `Item ${item} does not have feeds enabled`);
  }
  // 3. Item does not have RSS enabled
  if (!info.feed.providers.atom) {
    error(404, `Item ${item} does not have an Atom feed`);
  }

  const baseUrl = `${req.url.protocol}//${req.url.host}`;
  const itemUrl = `${baseUrl}${item === '/' ? '' : item}`;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('feed')
    .att('xmlns', 'http://www.w3.org/2005/Atom');

  // Set Minifolio as generator
  root.ele('generator').att('uri', consts.APP_DOCS).att('version', version).txt(consts.APP_NAME);

  // Self link, as per https://kevincox.ca/2022/05/06/rss-feed-best-practices/#self-link
  root.ele('link')
    .att('href', `${itemUrl}/feed.atom`)
    .att('rel', 'self')
    .att('type', consts.MIME_TYPES.ATOM);

  // Add link to blog site
  root.ele('link')
    .att('href', itemUrl)
    .att('rel', 'alternate')
    .att('type', consts.MIME_TYPES.HTML);

  // Add basic info
  root.ele('title').txt(info.feed.title);
  root.ele('id').txt(itemUrl);
  await addAuthorInfo(item, root);

  // Feed subtitle -- use SEO description if possible
  root.ele('subtitle').txt(info.seo.description ?? info.description);

  // Icon -- favicon
  if (info.icon) {
    const config = await getConfig();
    const url = config.siteIcon
      ? `${baseUrl}/data/${config.siteIcon}`
      : `${baseUrl}${consts.APP_ICON_URL}`;
    root.ele('icon').txt(url);
  }
  // Banner -- this item's banner image
  if (info.banner) {
    root.ele('icon').txt(itemFileUrl(item, info.banner));
  }

  // Determine last-updated time
  // Doing a manual implementation of Math.min is pretty yucky code tbh
  // Sounds like a good case for a design pattern or something, but I really cannot be bothered
  // right now (eepy)
  let lastUpdated = unixTime();
  for (const child of info.children) {
    // eslint-disable-next-line no-await-in-loop
    const childInfo = await getItemInfo(itemId.child(item, child));
    if (childInfo.timeEdited < lastUpdated) {
      lastUpdated = info.timeEdited;
    }
  }
  root.ele('updated').txt(unixToIsoTime(lastUpdated));

  // Only add public children
  for (const child of info.children) {
    const childId = itemId.child(item, child);
    const xmlChild = root.ele('entry');
    const childUrl = `${baseUrl}${childId}`;
    // Really should look up all child item infos concurrently, but can't be bothered at the moment
    // eslint-disable-next-line no-await-in-loop
    const childInfo = await getItemInfo(childId);
    // Link to entry
    xmlChild.ele('link')
      .att('href', childUrl)
      .att('rel', 'alternate')
      .att('type', consts.MIME_TYPES.HTML);

    xmlChild.ele('title').txt(childInfo.name);
    xmlChild.ele('id').txt(childUrl);
    // Use SEO description if provided, as it is more likely to be interesting to readers
    xmlChild.ele('summary').txt(childInfo.seo.description ?? childInfo.description);

    // Author info
    // eslint-disable-next-line no-await-in-loop
    await addAuthorInfo(childId, xmlChild);


    // Content: link to site
    // xmlChild.ele('content').att('src', childUrl).att('type', consts.MIME_TYPES.HTML);

    // TODO: Investigate using categories based on the links of an item
    // https://validator.w3.org/feed/docs/atom.html#category

    // Publication and update times as an ISO time string
    // Also of note, we need to multiple the UNIX timestamp by 1000 as JS works in milliseconds for
    // its timestamps, rather than seconds (to my knowledge, the typical format).
    xmlChild.ele('published').txt(unixToIsoTime(childInfo.timeCreated));
    xmlChild.ele('updated').txt(unixToIsoTime(childInfo.timeEdited));
  }


  const xml = root.end({ prettyPrint: dev });
  return new Response(
    xml,
    {
      headers: {
        'Content-Type': consts.MIME_TYPES.ATOM,
        'Content-Length': `${Buffer.from(xml, 'utf-8').length}`,
      }
    }
  );
}

async function addAuthorInfo(item: ItemId, node: XMLBuilder) {
  const authorInfo = await getFeedAuthor(item);
  if (authorInfo) {
    const xmlAuthor = node.ele('author');
    if (authorInfo.name) {
      xmlAuthor.ele('name').txt(authorInfo.name);
    }
    if (authorInfo.email) {
      xmlAuthor.ele('email').txt(authorInfo.email);
    }
    if (authorInfo.uri) {
      xmlAuthor.ele('uri').txt(authorInfo.uri);
    }
  }
}

async function getFeedAuthor(item: ItemId): Promise<AuthorInfo | null> {
  for (const ancestor of itemId.ancestors(item)) {
    // Really should look this info up in parallel
    // At least it'll be better once I cache the data again...
    // eslint-disable-next-line no-await-in-loop
    const info = await getItemInfo(ancestor);
    if (info.author) {
      return info.author;
    }
  }
  return null;
}
