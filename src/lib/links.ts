import { type ItemId } from './itemId';
import type { ItemInfo } from './server/data/item';

/** Supported display styles for links */
export const linkDisplayStyles = ['chip', 'card'] as const;

/** Returns whether the given item links to the target */
export function itemHasLink(item: ItemInfo, targetItem: ItemId) {
  return item.sections.find((section) => {
    if (section.type === 'links') {
      return section.items.find(linkedItem => linkedItem === targetItem);
    } else {
      return false;
    }
  }) !== undefined;
}
