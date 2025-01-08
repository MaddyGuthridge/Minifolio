import { getDescendant } from './itemData';
import type { ItemId } from './itemId';
import { itemHasLink } from './links';
import type { ItemData } from './server/data/item';

/**
 * 2D Array of filter items to display, including whether they are selected.
 *
 * Each array of items is displayed split by a separator.
 */
export type FilterOptions = {
  /** Item ID of the item */
  itemId: ItemId;
  /** Whether the item is selected */
  selected: boolean;
}[][];

/** Create an item filter for the given items */
export function createItemFilter(portfolio: ItemData, parentId: ItemId): FilterOptions {
  return getDescendant(portfolio, parentId).info.filters
    .map(filterItem => (
      getDescendant(portfolio, filterItem).info.children
        .map(itemId => ({ itemId: [...filterItem, itemId], selected: false }))
    ))
    .filter(group => group.length);
}

/**
 * Returns a list of itemIds within the given groupId that match the given filter
 *
 * @param globals global data
 * @param groupId group ID to find items within
 * @param filter filter options
 */
export function applyFiltersToItemChildren(
  portfolio: ItemData,
  itemId: ItemId,
  filter: FilterOptions,
): ItemId[] {
  // Figure out what items to show to start with
  const items: ItemId[] = getDescendant(portfolio, itemId).info.children.map(child => [...itemId, child]);

  // Reduce items based on the filter
  return filter.reduce(
    (prevItems, filterSet) => {
      const selectedFilters = filterSet.filter(f => f.selected);
      // If there are no selections, don't modify the items
      if (!selectedFilters.length) {
        return prevItems;
      }
      // For each item, check if it links to any selected filters
      return prevItems.filter(itemId => {
        const itemToCheck = getDescendant(portfolio, itemId);
        // Item must meet all selected filters
        // If we can find one that doesn't match, exclude it
        return undefined !== selectedFilters.find(f => itemHasLink(itemToCheck.info, f.itemId));
      });
    },
    items,
  );
}
