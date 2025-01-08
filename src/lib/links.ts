import { itemIdsEqual, type ItemId } from './itemId';
import type { ItemInfo } from './server/data/item';

/** Returns whether the given item links to the target */
export function itemHasLink(item: ItemInfo, targetItem: ItemId) {
  return item.sections.find(section => {
    if (section.type === 'links') {
      return section.items.find(linkedItem => itemIdsEqual(linkedItem, targetItem));
    } else {
      return false;
    }
  }) !== undefined;
}
