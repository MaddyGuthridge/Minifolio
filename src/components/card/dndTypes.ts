import type { ItemId } from '$lib/itemId';

export type DndInfo = {
  /** Drag and drop ID, to prevent dragging between incompatible types */
  dndId: string;
  /** itemId being dropped on (or undefined if not dropping on an item) */
  itemId: ItemId | undefined;
};
