/**
 * Functions for getting URLs
 */

import type { ItemId } from './itemId';

/**
 * Get file within item
 */
export function itemFileUrl(item: ItemId, file: string) {
  if (item !== '/') {
    return `/data${item}/${file}`;
  } else {
    return `/data/${file}`
  }
}

export function itemDataUrl(item: ItemId) {
  return `/data${item}`;
}
