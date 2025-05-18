import itemId from '$lib/itemId';
import consts from '$lib/consts';
import { getItemInfo, itemExists } from '$lib/server/data/item';
import { itemFileUrl } from '$lib/urls';
import { error } from '@sveltejs/kit';
import { create } from 'xmlbuilder2';

type Request = import('./$types').RequestEvent;

/**
 * Get the current value of the RSS feed for this item.
 *
 * Based on documentation from `https://www.rssboard.org/rss-specification`
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
  if (!info.feed.providers.rss) {
    error(404, `Item ${item} does not have an RSS feed`);
  }

  const baseUrl = `${req.url.protocol}//${req.url.host}`;
  const itemUrl = `${baseUrl}${item === '/' ? '' : item}`;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss')
    .att('version', '2.0')
    .att('xmlns:atom', 'http://www.w3.org/2005/Atom')
    .ele('channel');

  // Use atom namespace for self-link to make it easier to cache
  // https://stackoverflow.com/a/48138913/6335363
  // https://www.rssboard.org/rss-profile#namespace-elements-atom-link
  root.ele('atom:link')
    .att('href', `${itemUrl}/rss.xml`)
    .att('rel', 'self')
    .att('type', 'application/rss+xml');

  // Add basic info
  root.ele('title').txt(info.feed.title);
  root.ele('link').txt(itemUrl);
  root.ele('description').txt(info.description);
  root.ele('generator').txt(consts.APP_NAME);
  // Use banner image if present
  if (info.banner) {
    const xmlImg = root.ele('image');
    xmlImg.ele('url').txt(itemFileUrl(item, info.banner));
    xmlImg.ele('title').txt(info.feed.title);
    xmlImg.ele('link').txt(itemUrl);
  }

  // Only add public children
  for (const child of info.children) {
    const childId = itemId.child(item, child);
    const xmlChild = root.ele('item');
    const childUrl = `${baseUrl}${childId}`;
    // Really should look up all child item infos concurrently, but can't be bothered at the moment
    // eslint-disable-next-line no-await-in-loop
    const childInfo = await getItemInfo(childId);
    xmlChild.ele('title').txt(childInfo.name);
    xmlChild.ele('link').txt(childUrl);
    // Use SEO description if provided, as it is more likely to be interesting to readers
    xmlChild.ele('description').txt(childInfo.seo.description ?? childInfo.description);
    // TODO: Investigate using categories based on the links of an item
    // https://www.rssboard.org/rss-specification#ltcategorygtSubelementOfLtitemgt

    // Use the URL as the unique identifier so that we can specify that it is a permalink.
    // This will break if the user moves or renames items, so in future it could be a good idea to
    // give every item a UUID instead, but for now, this is fine.
    xmlChild.ele('guid').att('isPermaLink', 'true').txt(childUrl);

    // Publication time should be an RFC7231 date
    // Technically, the docs I'm referring to say RFC822, but it has seemingly been superseded
    // repeatedly, with RFC7231 being the latest.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toUTCString
    // Also of note, we need to multiple the UNIX timestamp by 1000 as JS works in milliseconds for
    // its timestamps, rather than seconds (to my knowledge, the typical format).
    xmlChild.ele('pubDate').txt(new Date(info.timeCreated * 1000).toUTCString());
  }

  const xml = root.end();
  return new Response(
    xml,
    {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': `${Buffer.from(xml, 'utf-8').length}`,
      }
    }
  );
}
