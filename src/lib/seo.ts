/**
 * Helper functions used in SEO (search engine optimization).
 */

import itemId, { type ItemId } from './itemId';
import type { ItemData } from './server/data/item';

export function generateKeywords(data: ItemData, id: ItemId): string {
  const keywords: string[] = [];

  for (const child of itemId.components(id)) {
    keywords.push(...data.info.seo.keywords);
    data = data.children[child];
  }

  return keywords.join(', ');
}
