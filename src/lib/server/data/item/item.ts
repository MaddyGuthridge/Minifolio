/**
 * An item represents an entry within the portfolio.
 *
 * This file contains type definitions and helper functions for accessing and modifying items.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { array, nullable, string, type, type Infer } from 'superstruct';
import validate from '$lib/validate';
import serverValidate from '$lib/server/serverValidate';
import itemId, { type ItemId } from '../../../itemId';
import { getDataDir } from '../dataDir';
import { ItemSectionStruct, validateSection } from './section';
import { applyStruct } from '../../util';
import { rimraf } from 'rimraf';

/**
 * Files that are reserved in an item -- these cannot be deleted without deleting the entire item
 */
const RESERVED_FILENAMES = [
  'info.json',
  'README.md',
];
/** Files that are reserved for the root item -- these cannot be deleted. */
const ROOT_ITEM_RESERVED_FILENAMES = ['config.json'];

/**
 * Information about an item, stored in its `info.json`.
 *
 * IMPORTANT: Do not validate using this struct alone -- instead, call `validateItemInfo`
 */
export const ItemInfoStruct = type({
  /**
   * The name of the item, displayed in the navigator when on this page, as well as on Card
   * elements.
   */
  name: string(),
  /**
   * A shortened name of the item, displayed in the navigator when on a child page, as well as on
   * Chip elements.
   */
  shortName: nullable(string()),
  /**
   * A short description to use for this item. This is shown on Card elements, and as a tooltip for
   * Chip elements.
   */
  description: string(),
  /** The icon image to use for this item, as a path relative to this item's root location. */
  icon: nullable(string()),
  /** The banner image to use for this item, as a path relative to this item's root location. */
  banner: nullable(string()),
  /** A hexadecimal color to use for the item. */
  color: string(),
  /** Sections to display on the item's page */
  sections: array(ItemSectionStruct),
  /**
   * Items to list as children of this item. Items not in this list will be unlisted, but still
   * accessible if their URL is accessed directly.
   */
  children: array(string()),
  /** Array of item IDs whose children should be used as filters for children of this item. */
  filters: array(itemId.Struct),
  /** SEO properties, placed in the document `<head>` to improve placement in search engines. */
  seo: type({
    /**
     * A description of the page, presented to search engines. If null, a simple template is
     * generated based on the template of a parent.
     */
    description: nullable(string()),
    /**
     * Keywords to use for the group. These are presented to search engines for this item, and for
     * its children.
     */
    keywords: array(string()),
  }),
});

/** Information about an item, stored in its `info.json` */
export type ItemInfo = Infer<typeof ItemInfoStruct>;

/** Returns the path to an item's directory */
export function itemPath(item: ItemId, file?: string): string {
  // Note, path.join() with an empty string has no effect
  return path.join(getDataDir(), item, file ?? '');
}

/** Returns whether the given item exists */
export async function itemExists(item: ItemId): Promise<boolean> {
  return await fs.access(itemPath(item, 'info.json'), fs.constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

/** Validate that the given item info is valid */
export async function validateItemInfo(item: ItemId, data: any): Promise<ItemInfo> {
  // Validate new info.json
  const info = applyStruct(data, ItemInfoStruct);

  // name
  validate.name(info.name);
  // shortName
  if (info.shortName !== null) {
    validate.name(info.shortName);
  }
  // Icon and banner images
  if (info.icon !== null) {
    await serverValidate.image(item, info.icon);
  }
  if (info.banner !== null) {
    await serverValidate.image(item, info.banner);
  }
  // Item color
  validate.color(info.color);

  // Validate each section
  await Promise.all(info.sections.map(section => validateSection(item, section)));

  // Ensure each child exists
  async function validateChild(child: string) {
    if (!await itemExists(itemId.child(item, child))) {
      error(400, `Child item '${itemId.child(item, child)}' does not exist`);
    }
  }
  await Promise.all(info.children.map(child => validateChild(child)));

  // Ensure each filter item exists
  async function validateFilterItem(filterItem: ItemId) {
    if (!await itemExists(filterItem)) {
      error(400, `Filter item '${filterItem}' does not exist`);
    }
    if (item === filterItem) {
      error(400, 'Filter items cannot be self-referencing');
    }
  }
  await Promise.all(info.filters.map(filter => validateFilterItem(filter)));

  // SEO description
  if (info.seo.description !== null) {
    if (info.seo.description.length === 0) {
      error(400, 'SEO description cannot be an empty string (use null instead)');
    }
  }

  return info;
}

/** Return the item's `info.json` */
export async function getItemInfo(item: ItemId): Promise<ItemInfo> {
  // Currently load from the disk every time -- should implement caching at some point
  const result = JSON.parse(await fs.readFile(itemPath(item, 'info.json'), { encoding: 'utf-8' }));
  // Don't fully validate info when loading data, or we'll get infinite recursion
  return applyStruct(result, ItemInfoStruct);
}

/** Update the given item's `info.json` */
export async function setItemInfo(item: ItemId, data: ItemInfo): Promise<void> {
  await fs.writeFile(
    itemPath(item, 'info.json'),
    JSON.stringify(data, undefined, 2),
    { encoding: 'utf-8' }
  );
}

/** Remove links to the target within the given item */
function removeLinkToItem(target: ItemId, item: ItemInfo): ItemInfo {
  for (const section of item.sections) {
    if (section.type === 'links') {
      section.items = section.items.filter(link => link !== target);
    }
  }
  item.filters = item.filters.filter(filter => target !== filter);
  return item;
}

/** Delete the given item, and all references to it */
export async function deleteItem(itemToDelete: ItemId): Promise<void> {
  await rimraf(itemPath(itemToDelete));
  const parentId = itemId.parent(itemToDelete);
  // Remove from parent
  const parentInfo = await getItemInfo(parentId);
  parentInfo.children = parentInfo.children.filter(child => child !== itemId.suffix(itemToDelete));
  await setItemInfo(parentId, parentInfo);
  // Clean up references in other items
  for await (const otherItemId of iterItems()) {
    const otherItem = await getItemInfo(otherItemId);
    await setItemInfo(otherItemId, removeLinkToItem(itemToDelete, otherItem));
  }
}

/**
 * Async generator function that yields ItemIds of direct child items to the given item.
 */
export async function* itemChildren(item: ItemId): AsyncIterableIterator<ItemId> {
  for await (const dirent of await fs.opendir(itemPath(item))) {
    if (dirent.isDirectory()) {
      const child = itemId.child(item, dirent.name);
      if (await itemExists(child)) {
        yield child;
      }
    }
  }
}

/**
 * Async generator function that yields ItemIds of all descendants of the given item.
 *
 * Performs depth-first iteration over the directory tree.
 *
 * ```txt
 * parent
 * - child 1
 *   - grandchild 1
 *   - grandchild 2
 * - child 2
 *   - grandchild 3
 * ...etc
 * ```
 */
export async function* iterItems(item: ItemId = itemId.ROOT): AsyncIterableIterator<ItemId> {
  yield item;
  for await (const child of itemChildren(item)) {
    for await (const descendant of iterItems(child)) {
      yield descendant;
    }
  }
}

/** Full data for the item, including its `info.json`, `README.md`, and list of children */
export type ItemData = {
  /** `info.json` */
  info: ItemInfo,
  /** `README.md` */
  readme: string,
  /** List of children (including unlisted children) */
  children: Record<string, ItemData>,
  /** List of files within the item's data */
  ls: string[],
}

/** Returns the full text data for the given item */
export async function getItemData(item: ItemId): Promise<ItemData> {
  const info = await getItemInfo(item);
  const readme = await fs.readFile(itemPath(item, 'README.md'), { encoding: 'utf-8' });

  const children: Record<string, ItemData> = {};
  for await (const child of itemChildren(item)) {
    children[itemId.suffix(child)] = await getItemData(child);
  }

  const ls = [];
  for await (const dirent of await fs.opendir(itemPath(item))) {
    if (dirent.isFile()) {
      if (RESERVED_FILENAMES.includes(dirent.name)) continue;
      if (item === '/' && ROOT_ITEM_RESERVED_FILENAMES.includes(dirent.name)) continue;
      ls.push(dirent.name);
    }
  }

  return {
    info,
    readme,
    children,
    ls,
  };
}
