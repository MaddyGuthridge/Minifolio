/**
 * An item represents an entry within the portfolio.
 *
 * This file contains type definitions and helper functions for accessing and modifying items.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import z from 'zod';
import validate, { type ItemId } from '$lib/validate';
import serverValidate from '$lib/server/serverValidate';
import itemId from '../../../itemId';
import { getDataDir } from '../dataDir';
import { ItemSectionStruct, validateSection } from './section';
import { move } from '../../util';
import { rimraf } from 'rimraf';
import { FeedOptionsStruct } from './feeds';

/**
 * Files that are reserved in an item -- these cannot be deleted without deleting the entire item
 */
const RESERVED_FILENAMES = ['info.json'];
/** Files that are reserved for the root item -- these cannot be deleted. */
const ROOT_ITEM_RESERVED_FILENAMES = ['config.json'];

export const AuthorInfoStruct = z.strictObject({
  /** The name of the author */
  name: z.string().nullable(),
  /** The author's email address */
  email: z.string().nullable(),
  /** A URI for the author */
  uri: z.string().nullable(),
  /** Fediverse attribution, eg `@maddy@tech.lgbt` */
  fediverse: z.string().nullable(),
});

export type AuthorInfo = z.infer<typeof AuthorInfoStruct>;

/**
 * Information about an item, stored in its `info.json`.
 *
 * IMPORTANT: Do not validate using this struct alone -- instead, call `validateItemInfo`
 */
export const ItemInfo = z.strictObject({
  /**
   * The name of the item, displayed in the navigator when on this page, as well as on Card
   * elements.
   */
  name: validate.name,
  /**
   * A shortened name of the item, displayed in the navigator when on a child page, as well as on
   * Chip elements.
   */
  shortName: validate.name.nullable(),
  /**
   * A short description to use for this item. This is shown on Card elements, and as a tooltip for
   * Chip elements.
   */
  description: z.string(),
  /** Time when this item was created, as a UNIX timestamp, in seconds */
  timeCreated: z.number(),
  /** Time when this item was last edited, as a UNIX timestamp, in seconds */
  timeEdited: z.number(),
  /**
   * The filename of the item's README file.
   *
   * This file must exist, and must be in a format supported by the README providers (eg Markdown,
   * Typst, HTML).
   */
  readme: z.string().nullable(),
  /**
   * Whether this item is an article, meaning that it is displayed with a narrower width and a serif
   * font.
   */
  article: z.boolean(),
  /**
   * The author of this item. If this is `null`, the value from the parent will be used instead.
   *
   * If any properties are `null`, they will be omitted.
   */
  author: AuthorInfoStruct.nullable(),
  /** Options for feeds, such as RSS and Atom */
  feed: FeedOptionsStruct.nullable(),
  /** The icon image to use for this item, as a path relative to this item's root location. */
  icon: z.string().nullable(),
  /** The banner image to use for this item, as a path relative to this item's root location. */
  banner: z.string().nullable(),
  /** A hexadecimal color to use for the item. */
  color: validate.color,
  /** Sections to display on the item's page */
  sections: z.array(ItemSectionStruct),
  /**
   * Items to list as children of this item. Items not in this list will be unlisted, but still
   * accessible if their URL is accessed directly.
   */
  children: z.array(validate.idComponent),
  /** Array of item IDs whose children should be used as filters for children of this item. */
  filters: z.array(validate.itemId),
  /** SEO properties, placed in the document `<head>` to improve placement in search engines. */
  seo: z.strictObject({
    /**
     * A description of the page, presented to search engines. If null, a simple template is
     * generated based on the template of a parent.
     */
    description: z.string().nullable(),
    /**
     * Keywords to use for the group. These are presented to search engines for this item, and for
     * its children.
     */
    keywords: z.array(z.string()),
  }),
});

/** Information about an item, stored in its `info.json` */
export type ItemInfo = z.infer<typeof ItemInfo>;

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
export async function validateItemInfo(item: ItemId, data: ItemInfo): Promise<ItemInfo> {
  // Validate new info.json
  const info = await ItemInfo.parseAsync(data).catch(e => error(400, e));

  // Icon and banner images
  if (info.icon !== null) {
    await serverValidate.image(item, info.icon);
  }
  if (info.banner !== null) {
    await serverValidate.image(item, info.banner);
  }

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
  return ItemInfo.parseAsync(result).catch(e => error(400, e));
}

/** Update the given item's `info.json` */
export async function setItemInfo(item: ItemId, data: ItemInfo): Promise<void> {
  await fs.writeFile(
    itemPath(item, 'info.json'),
    JSON.stringify(data, undefined, 2),
    { encoding: 'utf-8' },
  );
}

/** Rename links to the target within the given item */
function renameLinkToItem(oldTarget: ItemId, newTarget: ItemId, item: ItemInfo, andChildren = false): ItemInfo {
  const mapFn = andChildren
    ? (other: ItemId) => (itemId.isDescendant(other, oldTarget) ? itemId.replace(other, oldTarget, newTarget) : other)
    : (other: ItemId) => other === oldTarget ? newTarget : other;

  for (const section of item.sections) {
    if (section.type === 'links') {
      section.items = section.items.map(mapFn);
    }
  }
  item.filters = item.filters.map(mapFn);
  return item;
}

/** Remove links to the target within the given item */
function removeLinkToItem(target: ItemId, item: ItemInfo, andChildren = false): ItemInfo {
  const filterFn = andChildren
    ? (other: ItemId) => !itemId.isDescendant(other, target)
    : (other: ItemId) => other !== target;

  for (const section of item.sections) {
    if (section.type === 'links') {
      section.items = section.items.filter(filterFn);
    }
  }
  item.filters = item.filters.filter(filterFn);
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
    await setItemInfo(otherItemId, removeLinkToItem(itemToDelete, otherItem, true));
  }
}

/** Rename the given item, updating all references to it */
export async function moveItem(item: ItemId, target: ItemId) {
  if (itemId.isDescendant(target, item)) {
    error(400, `Cannot move '${item}' to a child of itself`);
  }

  const newParentId = itemId.parent(target);
  if (!await itemExists(newParentId)) {
    error(400, `Cannot move '${item}' - parent of target '${target}' does not exist`);
  }

  if (await itemExists(target)) {
    error(400, `Cannot move '${item}' - content already exists at target '${target}'`);
  }

  // Move from old item to new item
  await move(itemPath(item), itemPath(target));

  // Remove from listed children of parent
  const oldParent = await getItemInfo(itemId.parent(item));
  const oldSuffix = itemId.suffix(item);
  const listed = oldParent.children.includes(oldSuffix);
  if (listed) {
    // Remove from listed children of old parent
    oldParent.children = oldParent.children.filter(child => child !== oldSuffix);
    await setItemInfo(itemId.parent(item), oldParent);
    // Add to listed children of new parent
    const newParent = await getItemInfo(newParentId);
    newParent.children.push(itemId.suffix(target));
    await setItemInfo(newParentId, newParent);
  }

  // Update other references
  for await (const otherItemId of iterItems()) {
    const otherItem = await getItemInfo(otherItemId);
    await setItemInfo(otherItemId, renameLinkToItem(item, target, otherItem, true));
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
  /**
   * Contents of the file referenced as the readme in `info.json`.
   *
   * This info is provided as part of the page load data so that the readme is available immediately
   * on page load, which improves SEO and reduces user annoyance.
   */
  readme: string | null,
  /** List of children (including unlisted children) */
  children: Record<string, ItemData>,
  /** List of files within the item's data */
  ls: string[],
};

/** Returns the full text data for the given item */
export async function getItemData(item: ItemId): Promise<ItemData> {
  const info = await getItemInfo(item);
  const readme
    = info.readme !== null
      ? await fs.readFile(itemPath(item, info.readme), { encoding: 'utf-8' })
      : null;

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
