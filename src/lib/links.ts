import type { ItemInfoFull } from './server/data/itemOld';

/** Returns whether the given item links to the target */
export function itemHasLink(item: ItemInfoFull, targetGroup: string, targetItem: string) {
  return item.links.find(
    ([{ groupId }, items]) => groupId === targetGroup && items.includes(targetItem)
  ) !== undefined;
}
