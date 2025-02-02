/**
 * Functions for getting URLs
 */

import type { ItemId } from './itemId';

/**
 * Get file within item
 */
export function itemFileUrl(item: ItemId, file: string) {
  return `/data${item}/${file}`;
}

export function itemDataUrl(item: ItemId) {
  return `/data${item}`;
}
