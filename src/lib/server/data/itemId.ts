/**
 * Item ID type definitions and helper functions
 */
import { zip } from '$lib/util';
import { array, string, type Infer } from 'superstruct';

/** Return an item ID given its path in URL form */
export function itemIdFromUrl(path: string): ItemId {
  return path.split('/');
}

/** Format the given ItemId for displaying to users */
export function formatItemId(itemId: ItemId): string {
  const path = itemIdToUrl(itemId);
  return `'${path ? path : '/'}'`;
}

/** Update the ItemId to its URL path */
export function itemIdToUrl(itemId: ItemId): string {
  return itemId.join('/');
}

/** Returns the ItemId for the parent of the given item */
export function itemParent(itemId: ItemId): ItemId {
  return itemId.slice(0, -1)
}

/** Return whether the given ItemIds are equal */
export function itemIdsEqual(first: ItemId, second: ItemId): boolean {
  return zip(first, second).find(([a, b]) => a !== b) === undefined;
}

/**
 * Returns the "tail" of the item ID (the final element).
 *
 * Yes, I know this isn't `tail` in the Haskell sense, but I couldn't think of a better name for it.
 */
export function itemIdTail(itemId: ItemId): string {
  return itemId.at(-1)!;
}

/** The ID of an Item. An array of `string`s representing the path to that item within the data. */
export const ItemIdStruct = array(string());

/** The ID of an Item. An array of `string`s representing the path to that item within the data. */
export type ItemId = Infer<typeof ItemIdStruct>;
