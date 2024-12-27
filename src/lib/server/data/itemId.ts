/**
 * Item ID type definitions and helper functions
 */
import { array, string, type Infer } from 'superstruct';

/** Return an item ID given its path in URL form */
export function fromUrl(path: string): ItemId {
  return path.split('/');
}

/** Format the given ItemId for displaying to users */
export function formatItemId(itemId: ItemId): string {
  return `'${itemId.join('/')}'`;
}

/** The ID of an Item. An array of `string`s representing the path to that item within the data. */
export const ItemIdStruct = array(string());

/** The ID of an Item. An array of `string`s representing the path to that item within the data. */
export type ItemId = Infer<typeof ItemIdStruct>;
