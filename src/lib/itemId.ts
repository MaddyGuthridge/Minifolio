/**
 * Item ID type definitions and helper functions.
 */
import validate from '$lib/validate';
import { error } from '@sveltejs/kit';
import { string, type Infer } from 'superstruct';

/** The ID of an Item. A string in the form `/a/b/c/...` */
export const ItemIdStruct = string();

/** The ID of an Item. A string in the form `/a/b/c/...` */
export type ItemId = Infer<typeof ItemIdStruct>;

/** Ensure that an ItemId is valid */
export function validateItemId(itemId: ItemId): ItemId {
  if (!itemId.startsWith('/')) {
    error(400, "ItemId must have a leading '/'");
  }
  for (const component of itemComponents(itemId)) {
    validate.id('ItemId component', component);
  }
  return itemId;
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
export function fromComponents(components: string[]): ItemId {
  return `/${components.join('/')}`;
}

/** Returns the ItemId for the parent of the given item */
export function itemParent(itemId: ItemId): ItemId {
  return fromComponents(itemComponents(itemId).slice(1));
}

/** Return an ItemId of a child of the given ItemId */
export function itemChild(itemId: ItemId, child: string): ItemId {
  return fromComponents([...itemComponents(itemId), child]);
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
  return fromComponents(itemComponents(itemId).slice(1));
}

export function itemIdSlice(itemId: ItemId, start?: number, end?: number): ItemId {
  return fromComponents(itemComponents(itemId).slice(start, end));
}

export function itemidAt(itemId: ItemId, index: number): string {
  return itemComponents(itemId)[index];
}

export default {
  Struct: ItemIdStruct,
  validate: validateItemId,
  components: itemComponents,
  from: fromComponents,
  parent: itemParent,
  child: itemChild,
  suffix: itemIdSuffix,
  head: itemIdHead,
  tail: itemIdTail,
  slice: itemIdSlice,
  at: itemidAt,
}
