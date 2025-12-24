/**
 * Functions for navigating and operating on the `ItemData` type
 */

import itemId, { type ItemId } from './itemId';
import type { ItemData } from './server/data/item';
import type { AuthorInfo } from './server/data/item/item';

/**
 * Return a descendant of the given item data, using the given relative ItemId
 */
export function getDescendant(data: ItemData, id: ItemId) {
  if (id === '/') {
    return data;
  } else {
    return getDescendant(data.children[itemId.head(id)], itemId.tail(id));
  }
}

/**
 * Return the author of an item. This also checks parent items for author info.
 */
export function getItemAuthor(item: ItemId, data: ItemData): AuthorInfo | null {
  for (const parent of itemId.ancestors(item)) {
    const p = getDescendant(data, parent);
    if (p.info.author) {
      return p.info.author;
    }
  }
  return null;
}
