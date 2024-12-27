/**
 * Item ID type definitions and helper functions
 */
import { array, string, type Infer } from 'superstruct';

/** Return an item ID given its path in URL form */
export function itemIdFromUrl(path: string): ItemId {
  return path.split('/');
}

/** Format the given ItemId for displaying to users */
export function formatItemId(itemId: ItemId): string {
  const path = itemId.join('/');
  return `'${path ? path : '/'}'`;
}

/** Returns the ItemId for the parent of the given item */
export function itemParent(itemId: ItemId): ItemId {
  return itemId.slice(0, -1)
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
