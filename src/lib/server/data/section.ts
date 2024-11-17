/**
 * Represents a section of an item page.
 *
 * This file contains definitions for various sections.
 */

import { array, enums, literal, string, type } from 'superstruct';
import { ItemIdStruct } from './itemId';
import { RepoInfoStruct } from './itemRepo';
import { PackageInfoStruct } from './itemPackage';

/** Links from this item to other items. */
export const LinkSection = type({
  /** The type of section (in this case 'links') */
  type: literal('links'),
  /** The style in which to present the links ('chip' or 'card') */
  style: enums(['chip', 'card']),
  /** The array of item IDs to display as links */
  items: array(ItemIdStruct),
});

/** Code repository link */
export const RepoSection = type({
  /** The type of section (in this case 'repo') */
  type: literal('repo'),
  /** Information about the repository being linked */
  info: RepoInfoStruct,
});

/** Website link */
export const SiteSection = type({
  /** The type of section (in this case 'site') */
  type: literal('site'),
  /** The URL of the site being linked */
  url: string(),
});

/** Documentation link */
export const DocumentationSection = type({
  /** The type of section (in this case 'docs') */
  type: literal('docs'),
  /** The URL of the documentation being linked */
  url: string(),
});

/** Package information section */
export const PackageSection = type({
  /** The type of section (in this case 'package') */
  type: literal('package'),
  /** The URL of the site being linked */
  info: PackageInfoStruct,
});
