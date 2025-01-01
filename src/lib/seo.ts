/**
 * Helper functions used in SEO (search engine optimization).
 */

import type { ItemId } from './itemId';
import type { ItemData } from './server/data/item';

export function generateKeywords(data: ItemData, itemId: ItemId): string {
  const keywords: string[] = [];

  for (const child of itemId) {
    keywords.push(...data.info.seo.keywords);
    data = data.children[child];
  }

  return keywords.join(', ');
}
