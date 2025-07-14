/**
 * Item ID type definitions and helper functions.
 */
import validate from '$lib/validate';
import { error } from '@sveltejs/kit';
import { string, Struct } from 'superstruct';

/** The ID of an Item. A string in the form `/a/b/c/...` */
export type ItemId = string & { __itemId: string };

/** The ID of an Item. A string in the form `/a/b/c/...` */
// Janky override of the type definition, such that TypeScript knows that anything that is typed
// with this definition is assumed to be of type `ItemId`
export const ItemIdStruct: Struct<ItemId, null> = string() as any;

export const ROOT = '/' as ItemId;

/** Ensure that an ItemId is valid */
export function validateItemId(itemId: string): ItemId {
  if (!itemId.startsWith('/')) {
    error(400, "ItemId must have a leading '/'");
  }
  for (const component of itemIdComponents(itemId as ItemId)) {
    validate.id('ItemId component', component);
  }
  return itemId as ItemId;
}

/** Split an ItemId into its components */
export function itemIdComponents(itemId: ItemId): string[] {
  if (itemId === '/') {
    // Special case for root, since `'/'.split('/')` produces `['']`
    return [];
  }
  return itemId.slice(1).split('/');
}

/** Generate an ItemId from an array of components */
export function itemIdFromComponents(components: string[]): ItemId {
  return `/${components.join('/')}` as ItemId;
}

/** Create an ItemId with no validation */
export function itemIdFromStr(id: string): ItemId {
  return id as ItemId;
}

/** Returns the ItemId for the parent of the given item */
export function itemParent(itemId: ItemId): ItemId {
  return itemIdFromComponents(itemIdComponents(itemId).slice(0, -1));
}

/** Returns all ancestors of the given item ID, including itself */
export function itemAncestors(itemId: ItemId): ItemId[] {
  const ancestors = [itemId];
  while (itemId !== ROOT) {
    itemId = itemIdSlice(itemId, 0, -1);
    ancestors.push(itemId);
  }

  return ancestors;
}

/** Return an ItemId of a child of the given ItemId */
export function itemChild(itemId: ItemId, child: string): ItemId {
  return itemIdFromComponents([...itemIdComponents(itemId), child]);
}

/** Returns the "suffix" of the item ID (the final element) */
export function itemIdSuffix(itemId: ItemId): string {
  return itemIdComponents(itemId).at(-1)!;
}

/** Returns the "head" of the item ID (the first element) */
export function itemIdHead(itemId: ItemId): string {
  return itemIdComponents(itemId).at(0)!;
}

/** Returns the "tail" of the item ID (all elements after the first) */
export function itemIdTail(itemId: ItemId): ItemId {
  return itemIdFromComponents(itemIdComponents(itemId).slice(1));
}

/** Create an array slice from the components of the given item ID */
export function itemIdSlice(itemId: ItemId, start?: number, end?: number): ItemId {
  return itemIdFromComponents(itemIdComponents(itemId).slice(start, end));
}

/** Return the nth component of the given item ID */
export function itemIdAt(itemId: ItemId, index: number): string {
  return itemIdComponents(itemId).at(index)!;
}

/** Replace the search value with newValue within the given itemId */
export function itemIdReplace(itemId: ItemId, search: ItemId, newValue: ItemId): ItemId {
  return itemId.replace(search, newValue) as ItemId;
}

/**
 * Returns whether the item `first` is a descendant of the item `second`. Also returns `true` if
 * they are equal
 */
export function itemIsDescendant(first: ItemId, second: ItemId): boolean {
  // Slice `first` to same length as `second`, then check if they are equal
  return itemIdSlice(first, 0, itemIdComponents(second).length) === second;
}

export default {
  Struct: ItemIdStruct,
  ROOT,
  validate: validateItemId,
  components: itemIdComponents,
  fromComponents: itemIdFromComponents,
  fromStr: itemIdFromStr,
  parent: itemParent,
  ancestors: itemAncestors,
  child: itemChild,
  suffix: itemIdSuffix,
  head: itemIdHead,
  tail: itemIdTail,
  slice: itemIdSlice,
  at: itemIdAt,
  replace: itemIdReplace,
  isDescendant: itemIsDescendant,
};
