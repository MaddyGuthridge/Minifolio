/**
 * Represents a section of an item page.
 *
 * This file contains definitions for various sections.
 */
import { array, enums, literal, string, type, union, type Infer } from 'superstruct';
import { error } from '@sveltejs/kit';
import validate from '$lib/validate';
import { ItemIdStruct } from './itemId';
import { RepoInfoStruct } from './itemRepo';
import { PackageInfoStruct } from './itemPackage';
import { itemExists } from './item';

/** Links from this item to other items. */
export const LinksSection = type({
  /** The type of section (in this case 'links') */
  type: literal('links'),
  /** The text to display for the section (eg "See also") */
  title: string(),
  /** The style in which to present the links ('chip' or 'card') */
  style: enums(['chip', 'card']),
  /** The array of item IDs to display as links */
  items: array(ItemIdStruct),
});

/** Validate a links section of an item */
async function validateLinksSection(data: Infer<typeof LinksSection>) {
  validate.name(data.title);
  for (const item of data.items) {
    if (!await itemExists(item)) {
      error(400, `Linked item ${item} does not exist`);
    }
  }
}

/** Code repository link */
export const RepoSection = type({
  /** The type of section (in this case 'repo') */
  type: literal('repo'),
  /** The text to display for the section (eg "View the code") */
  title: string(),
  /** Information about the repository being linked */
  info: RepoInfoStruct,
});

/** Website link */
export const SiteSection = type({
  /** The type of section (in this case 'site') */
  type: literal('site'),
  /** The text to display for the section (eg "Visit the website") */
  title: string(),
  /** The URL of the site being linked */
  url: string(),
});

/** Documentation link */
export const DocumentationSection = type({
  /** The type of section (in this case 'docs') */
  type: literal('docs'),
  /** The text to display for the section (eg "View the documentation") */
  title: string(),
  /** The URL of the documentation being linked */
  url: string(),
});

/** Package information section */
export const PackageSection = type({
  /** The type of section (in this case 'package') */
  type: literal('package'),
  /** The text to display for the section (eg "Install the package") */
  title: string(),
  /** The URL of the site being linked */
  info: PackageInfoStruct,
});

/** A section on the item page */
export const ItemSectionStruct = union([
  LinksSection,
  RepoSection,
  SiteSection,
  DocumentationSection,
  PackageSection,
]);

export type ItemSection = Infer<typeof ItemSectionStruct>;

/** Validate the given section data */
export async function validateSection(data: ItemSection) {
  validate.name(data.title);
  // `links` section needs additional validation
  if (data.type === 'links') {
    await validateLinksSection(data);
  }
}
