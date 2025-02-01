import type { ItemId } from '$lib/itemId';

export type DndInfo = {
  dndId: string;
  itemId: ItemId | undefined;
};
