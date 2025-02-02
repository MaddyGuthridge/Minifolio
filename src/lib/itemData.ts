/**
 * Functions for navigating and operating on the `ItemData` type
 */

import type { ItemId } from './itemId';
import itemId from './itemId';
import type { ItemData } from './server/data/item';

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
