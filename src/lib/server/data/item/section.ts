/**
 * Represents a section of an item page.
 *
 * This file contains definitions for various sections.
 */
import { array, enums, literal, nullable, string, type, union, type Infer } from 'superstruct';
import { error } from '@sveltejs/kit';
import validate from '$lib/validate';
import { ItemIdStruct, type ItemId } from '$lib/itemId';
import { RepoInfoStruct } from './repo';
import { PackageInfoStruct } from './package';
import { itemExists } from './item';
import { linkDisplayStyles } from '$lib/links';
import { validateFile } from '$lib/server/serverValidate';

/** Header within the sections */
const HeadingSectionStruct = type({
  /** The type of section (in this case 'heading') */
  type: literal('heading'),
  /** The text to display as the heading */
  heading: string(),
});

/** Header within the sections */
export type HeadingSection = Infer<typeof HeadingSectionStruct>;

/** Links from this item to other items. */
const LinksSectionStruct = type({
  /** The type of section (in this case 'links') */
  type: literal('links'),
  /** The text to display for the section (eg "See also") */
  label: string(),
  /** The style in which to present the links ('chip' or 'card') */
  style: enums(linkDisplayStyles),
  /** The array of item IDs to display as links */
  items: array(ItemIdStruct),
});

/** Links from this item to other items. */
export type LinksSection = Infer<typeof LinksSectionStruct>;

/** Validate a links section of an item */
async function validateLinksSection(itemId: ItemId, data: LinksSection) {
  validate.name(data.label);
  async function validateLinkedItem(otherItem: ItemId) {
    if (!await itemExists(otherItem)) {
      error(400, `Linked item ${otherItem} does not exist`);
    }
    if (otherItem === itemId) {
      error(400, 'Links cannot be self-referencing');
    }
  }
  await Promise.all(data.items.map(otherItem => validateLinkedItem(otherItem)));
}

/** Backlinks from another group of items to this item */
const BacklinksSectionStruct = type({
  /** The type of section (in this case 'backlinks') */
  type: literal('backlinks'),
  /** The text to display for the section (eg "See also") */
  label: string(),
  /** The style in which to present the links ('chip' or 'card') */
  style: enums(linkDisplayStyles),
  /** Item whose children can be potentially shown */
  parentItem: ItemIdStruct,
});

/** Backlinks from another group of items to this item */
export type BacklinksSection = Infer<typeof BacklinksSectionStruct>;

async function validateBacklinksSection(itemId: ItemId, data: BacklinksSection) {
  validate.name(data.label);
  if (!await itemExists(data.parentItem)) {
    error(400, `Backlink parent item ${data.parentItem} does not exist`);
  }
}

/** Package information section */
const PackageSectionStruct = type({
  /** The type of section (in this case 'package') */
  type: literal('package'),
  /** The text to display for the section (defaults to "Install using [provider]") */
  label: nullable(string()),
  /** The URL of the site being linked */
  info: PackageInfoStruct,
});

/** Package information section */
export type PackageSection = Infer<typeof PackageSectionStruct>;

/** Code repository link */
const RepoSectionStruct = type({
  /** The type of section (in this case 'repo') */
  type: literal('repo'),
  /** The text to display for the section (defaults to "View the code on [provider]") */
  label: nullable(string()),
  /** Information about the repository being linked */
  info: RepoInfoStruct,
});

/** Code repository link */
export type RepoSection = Infer<typeof RepoSectionStruct>;

/** Website link */
const SiteSectionStruct = type({
  /** The type of section (in this case 'site') */
  type: literal('site'),
  /** The icon to display for the section (defaults to "la-globe") */
  icon: nullable(string()),
  /** The text to display for the section (defaults to "Visit the website") */
  label: nullable(string()),
  /** The URL of the site being linked */
  url: string(),
});

/** Website link */
export type SiteSection = Infer<typeof SiteSectionStruct>;

/** Website link */
const FeedSectionStruct = type({
  /** The type of section (in this case 'site') */
  type: literal('feed'),
  /** The icon to display for the section (defaults to "la-globe") */
  icon: nullable(string()),
  /** The text to display for the section (defaults to "Subscribe via RSS/Atom") */
  label: nullable(string()),
});

/** Website link */
export type FeedSection = Infer<typeof FeedSectionStruct>;

/** File download */
const DownloadSectionStruct = type({
  /** The type of section (in this case 'download') */
  type: literal('download'),
  /** The file-name of the file that should be downloaded */
  file: string(),
  /** The text to display for the section (defaults to "Download") */
  label: nullable(string()),
});

/** File download */
export type DownloadSection = Infer<typeof DownloadSectionStruct>;

/** A section on the item page */
export const ItemSectionStruct = union([
  HeadingSectionStruct,
  LinksSectionStruct,
  BacklinksSectionStruct,
  PackageSectionStruct,
  RepoSectionStruct,
  SiteSectionStruct,
  FeedSectionStruct,
  DownloadSectionStruct,
]);

/** A section on the item page */
export type ItemSection = Infer<typeof ItemSectionStruct>;

/** Available types of section */
export type SectionType = ItemSection['type'];

/** Validate the given section data */
export async function validateSection(itemId: ItemId, data: ItemSection) {
  switch (data.type) {
    case 'links':
      await validateLinksSection(itemId, data);
      break;
    case 'backlinks':
      await validateBacklinksSection(itemId, data);
      break;
    case 'heading':
      validate.name(data.heading);
      break;
    case 'site':
      if (data.label !== null) {
        validate.name(data.label);
      }
      validate.url(data.url);
      break;
    case 'feed':
      if (data.label !== null) {
        validate.name(data.label);
      }
      break;
    case 'download':
      if (data.label !== null) {
        validate.name(data.label);
      }
      await validateFile(itemId, data.file);
      break;
  }
}
