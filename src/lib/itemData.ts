/**
 * Functions for navigating and operating on the `ItemData` type
 */

import type { ItemId } from './itemId';
import type { ItemData } from './server/data/item';

/**
 * Return a descendant of the given item data, using the given relative ItemId
 */
export function getDescendant(data: ItemData, itemId: ItemId) {
  if (itemId.length === 0) {
    return data;
  } else {
    return getDescendant(data.children[itemId[0]], itemId.slice(1));
  }
}
