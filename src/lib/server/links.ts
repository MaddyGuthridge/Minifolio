/**
 * Code for managing links between items.
 */

import { error } from '@sveltejs/kit';
import type { PortfolioGlobals } from './data';
import { setItemInfo } from './data/itemOld';
import { itemHasLink } from '../links';

/** Add a link from groupId/itemId to otherGroupId/otherItemId */
export async function createLink(
  globals: PortfolioGlobals,
  groupId: string,
  itemId: string,
  otherGroupId: string,
  otherItemId: string,
) {
  const item = globals.items[groupId][itemId].info;

  // First hunt to see if it is already there
  for (const [{ groupId: linkedGroup }, items] of item.links) {
    if (linkedGroup === otherGroupId) {
      // Only add it if it isn't present
      if (!items.includes(otherItemId)) {
        items.push(otherItemId);
      }
      await setItemInfo(groupId, itemId, item);
      return;
    }
  }
  // If we reach this point, no links to that group have been made yet, create
  // one in the default style (chip)
  item.links.push([
    {
      groupId: otherGroupId,
      style: 'chip',
      title: globals.groups[otherGroupId].info.name
    },
    [otherItemId],
  ]);

  await setItemInfo(groupId, itemId, item);
}

/** Change the display style for links from the given item to another group */
export async function changeLinkStyle(
  globals: PortfolioGlobals,
  groupId: string,
  itemId: string,
  otherGroupId: string,
  // FIXME: Stop hard-coding this type
  style: 'chip' | 'card',
) {
  const item = globals.items[groupId][itemId].info;
  // Find linked group and update style
  // This code is sorta yucky imo
  let foundMatch = false;
  for (const [linkInfo, /* items */] of item.links) {
    if (linkInfo.groupId === otherGroupId) {
      linkInfo.style = style;
      foundMatch = true;
      break;
    }
  }
  if (!foundMatch) {
    error(400, `Group ${otherGroupId} has not been linked to in this item`);
  }

  await setItemInfo(groupId, itemId, item);
}

/** Remove the link from groupId/itemId to otherGroupId/otherItemId */
export async function removeLinkFromItem(
  globals: PortfolioGlobals,
  groupId: string,
  itemId: string,
  otherGroupId: string,
  otherItemId: string,
) {
  const item = globals.items[groupId][itemId].info;
  for (const [{ groupId: linkedGroup }, items] of item.links) {
    if (linkedGroup === otherGroupId) {
      // Only remove it if it is present
      if (items.includes(otherItemId)) {
        items.splice(items.indexOf(otherItemId), 1);
      }
      // Now if the linked group is empty, remove it from the item links
      if (!items.length) {
        // This feels yucky but I can't think of a prettier way of doing it
        // without making a copy
        item.links.splice(
          item.links.findIndex(l => l[0].groupId === otherGroupId),
          1,
        );
      }
      await setItemInfo(groupId, itemId, item);
      return;
    }
  }
}

/** Removes all links that point to the given item */
export async function removeAllLinksToItem(
  globals: PortfolioGlobals,
  groupId: string,
  itemId: string,
) {
  // We can't reliably do a reverse lookup, as it is possible to create links
  // that aren't two-way
  // Instead, we need to manually search through all items
  const itemsToUnlink: [string, string][] = [];

  for (const otherGroupId of Object.keys(globals.groups)) {
    for (const otherItemId of Object.keys(globals.items[otherGroupId])) {
      const otherItem = globals.items[otherGroupId][otherItemId];
      if (itemHasLink(otherItem.info, groupId, itemId)) {
        itemsToUnlink.push([otherGroupId, otherItemId]);
      }
    }
  }

  await Promise.all(
    itemsToUnlink.map(([otherGroup, otherItem]) =>
      removeLinkFromItem(globals, otherGroup, otherItem, groupId, itemId))
  );
}
