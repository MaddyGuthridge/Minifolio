/**
 * Functions for getting URLs
 */

import type { ItemId } from './itemId';

/**
 * Get file within item
 */
export function itemFileUrl(item: ItemId, file: string) {
  return `/data/${[...item, file].join('/')}`;
}

export function itemUrl(item: ItemId) {
  return `/${item.join('/')}`;
}
