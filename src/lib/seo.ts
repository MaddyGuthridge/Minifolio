/**
 * Helper functions used in SEO (search engine optimization).
 */

import { getDescendant } from './itemData';
import itemId, { type ItemId } from './itemId';
import type { ItemData } from './server/data/item';

/**
 * Generate a list of keywords to use for SEO
 * @param data full site data
 * @param id item ID to generate keywords for
 * @returns string of keywords, to use in `<meta name="keywords">` attribute
 */
export function generateKeywords(data: ItemData, id: ItemId): string {
  const keywords: string[] = [];

  for (const child of itemId.components(id)) {
    keywords.push(...data.info.seo.keywords);
    data = data.children[child];
  }
  keywords.push(...data.info.seo.keywords.filter(kw => kw.length));

  return keywords.join(', ');
}

/**
 * Returns the description to use for SEO
 * @param data full site data
 * @param id item ID to load description for
 */
export function getDescription(data: ItemData, id: ItemId): string | null {
  for (const ancestor of itemId.ancestors(id)) {
    const ancestorInfo = getDescendant(data, ancestor).info;
    if (ancestorInfo.seo.description) {
      return ancestorInfo.seo.description;
    }
  }
  return null;
}
