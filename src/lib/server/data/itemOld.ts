/**
 * Access item data
 */

import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { array, intersection, object, nullable, string, tuple, type, validate, type Infer, enums } from 'superstruct';
import { getDataDir } from './dataDir';
import { rimraf } from 'rimraf';
import { RepoInfoStruct } from './itemRepo';
import { PackageInfoStruct } from './itemPackage';
import formatTemplate from '../formatTemplate';

const DEFAULT_README = `
# {{item}}

{{description}}

This is the \`README.md\` file for the item {{item}}. Go ahead and modify it to
tell everyone more about it. Is it something you made, or something you use?
How does it demonstrate your abilities?
`;

/** Brief info about an item */
export const ItemInfoBriefStruct = type({
  /** User-facing name of the item */
  name: string(),

  /** Short description of the item */
  description: string(),

  /** Description to use for the webpage of the item, used in SEO */
  pageDescription: string(),

  /**
   * SEO keywords to use for this group. These are combined with the site and
   * group keywords.
   */
  keywords: array(string()),

  /** Color */
  color: string(),

  /** Icon to display in lists */
  icon: nullable(string()),

  /** Banner image to display on item page */
  banner: nullable(string()),
});

/** Brief info about an item */
export type ItemInfoBrief = Infer<typeof ItemInfoBriefStruct>;

export const LinkStyleStruct = enums(['chip', 'card']);

/**
 * Links (associations) with other items.
 *
 * Array of `[group, [...items]]`
 *
 * * Each `group` is a group ID
 * * Each item in `items` is an item ID within that group
 */
export const LinksArray = array(
  tuple([
    object({
      groupId: string(),
      style: LinkStyleStruct,
      title: string(),
    }),
    array(string()),
  ])
);

/** Full information about an item */
export const ItemInfoFullStruct = intersection([
  ItemInfoBriefStruct,
  type({
    /** Links to other items */
    links: LinksArray,

    /** URLs associated with the label */
    urls: object({
      /** URL of the source repository of the label */
      repo: nullable(RepoInfoStruct),

      /** URL of the site demonstrating the label */
      site: nullable(string()),

      /** URL of the documentation site for the label */
      docs: nullable(string()),
    }),

    /** Information about the package distribution of the label */
    package: nullable(PackageInfoStruct),
  }),
]);

/** Full information about an item */
export type ItemInfoFull = Infer<typeof ItemInfoFullStruct>;

/**
 * Return the full list of items within a group.
 *
 * This includes items not included in the main list.
 */
export async function listItems(groupId: string): Promise<string[]> {
  return (await readdir(`${getDataDir()}/${groupId}`, { withFileTypes: true }))
    // Only keep directories
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

/** Return the full info about the item from the given group with the given ID */
export async function getItemInfo(groupId: string, itemId: string): Promise<ItemInfoFull> {
  const infoJsonPath = `${getDataDir()}/${groupId}/${itemId}/info.json`;
  const data = await readFile(
    infoJsonPath,
    { encoding: 'utf-8' }
  );

  // Validate data
  const [err, parsed] = validate(JSON.parse(data), ItemInfoFullStruct);
  if (err) {
    console.log(`Error while parsing '${infoJsonPath}'`);
    console.error(err);
    throw err;
  }

  return parsed;
}

/** Return the brief info about the item with the given ID */
export async function getItemInfoBrief(groupId: string, itemId: string): Promise<ItemInfoBrief> {
  const info = await getItemInfo(groupId, itemId);

  return {
    name: info.name,
    description: info.description,
    pageDescription: info.pageDescription,
    keywords: info.keywords,
    color: info.color,
    icon: info.icon,
    banner: info.banner,
  };
}

/** Update the full info about the item with the given ID */
export async function setItemInfo(groupId: string, itemId: string, info: ItemInfoFull) {
  const infoJsonPath = `${getDataDir()}/${groupId}/${itemId}/info.json`;
  await writeFile(
    infoJsonPath,
    JSON.stringify(info, undefined, 2),
  );
}

/** Returns the contents of the item's README.md */
export async function getItemReadme(groupId: string, itemId: string): Promise<string> {
  return readFile(
    `${getDataDir()}/${groupId}/${itemId}/README.md`,
    { encoding: 'utf-8' },
  );
}

/** Update the contents of the item's README.md */
export async function setItemReadme(groupId: string, itemId: string, readme: string) {
  await writeFile(
    `${getDataDir()}/${groupId}/${itemId}/README.md`,
    readme,
  );
}

/** Creates a new item with the given ID and name */
export async function createItem(groupId: string, itemId: string, name: string, description: string) {
  await mkdir(`${getDataDir()}/${groupId}/${itemId}`);

  // If there is a description, add it to the readme text
  const readme = formatTemplate(DEFAULT_README, [['item', name], ['description', description]])
    // If the description was empty, we'll end up with extra newlines -- get
    // rid of them.
    .replace('\n\n\n', '');

  await setItemInfo(groupId, itemId, {
    name,
    description,
    pageDescription: '',
    keywords: [name],
    // TODO: Generate a random color for the new item
    color: '#aa00aa',
    links: [],
    urls: {
      repo: null,
      site: null,
      docs: null
    },
    package: null,
    icon: null,
    banner: null,
  });
  await setItemReadme(groupId, itemId, readme);
}

/** Removes the item with the given ID */
export async function deleteItem(groupId: string, itemId: string) {
  await rimraf(`${getDataDir()}/${groupId}/${itemId}`);
}

/**
 * Overall data for an item, comprised of the item's `info.json`, `README.md`
 * and potentially other data as required.
 */
export type ItemData = {
  info: ItemInfoFull,
  readme: string,
}

/** Return full data for the item */
export async function getItemData(groupId: string, itemId: string) {
  return {
    info: await getItemInfo(groupId, itemId),
    readme: await getItemReadme(groupId, itemId),
  };
}
