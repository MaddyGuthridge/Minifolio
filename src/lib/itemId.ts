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
  for (const component of itemComponents(itemId as ItemId)) {
    validate.id('ItemId component', component);
  }
  return itemId as ItemId;
}

/** Split an ItemId into its components */
export function itemComponents(itemId: ItemId): string[] {
  if (itemId === '/') {
    // Special case for root, since `''.split('/')` produces `['']`
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
  return itemIdFromComponents(itemComponents(itemId).slice(0, -1));
}

/** Return an ItemId of a child of the given ItemId */
export function itemChild(itemId: ItemId, child: string): ItemId {
  return itemIdFromComponents([...itemComponents(itemId), child]);
}

/** Returns the "suffix" of the item ID (the final element) */
export function itemIdSuffix(itemId: ItemId): string {
  return itemComponents(itemId).at(-1)!;
}

/** Returns the "head" of the item ID (the firstelement) */
export function itemIdHead(itemId: ItemId): string {
  return itemComponents(itemId).at(0)!;
}

export function itemIdTail(itemId: ItemId): ItemId {
  return itemIdFromComponents(itemComponents(itemId).slice(1));
}

export function itemIdSlice(itemId: ItemId, start?: number, end?: number): ItemId {
  return itemIdFromComponents(itemComponents(itemId).slice(start, end));
}

export function itemidAt(itemId: ItemId, index: number): string {
  return itemComponents(itemId).at(index)!;
}

export default {
  Struct: ItemIdStruct,
  ROOT,
  validate: validateItemId,
  components: itemComponents,
  fromComponents: itemIdFromComponents,
  fromStr: itemIdFromStr,
  parent: itemParent,
  child: itemChild,
  suffix: itemIdSuffix,
  head: itemIdHead,
  tail: itemIdTail,
  slice: itemIdSlice,
  at: itemidAt,
}
