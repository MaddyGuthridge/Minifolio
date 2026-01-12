/**
 * Represents a section of an item page.
 *
 * This file contains definitions for various sections.
 */
import z from 'zod';
import { error } from '@sveltejs/kit';
import validate, { type ItemId } from '$lib/validate';
import { RepoInfo } from './repo';
import { PackageInfoStruct } from './package';
import { itemExists } from './item';
import { linkDisplayStyles } from '$lib/links';
import { validateFile } from '$lib/server/serverValidate';

/** Header within the sections */
const HeadingSection = z.strictObject({
  /** The type of section (in this case 'heading') */
  type: z.literal('heading'),
  /** The text to display as the heading */
  heading: validate.name,
});

/** Header within the sections */
export type HeadingSection = z.infer<typeof HeadingSection>;

/** Links from this item to other items. */
const LinksSection = z.strictObject({
  /** The type of section (in this case 'links') */
  type: z.literal('links'),
  /** The text to display for the section (eg "See also") */
  label: validate.name.nullable(),
  /** The style in which to present the links ('chip' or 'card') */
  style: z.enum(linkDisplayStyles),
  /** The array of item IDs to display as links */
  items: z.array(validate.itemId),
});

/** Links from this item to other items. */
export type LinksSection = z.infer<typeof LinksSection>;

/** Validate a links section of an item */
async function validateLinksSection(itemId: ItemId, data: LinksSection) {
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
const BacklinksSectionStruct = z.strictObject({
  /** The type of section (in this case 'backlinks') */
  type: z.literal('backlinks'),
  /** The text to display for the section (eg "See also") */
  label: validate.name,
  /** The style in which to present the links ('chip' or 'card') */
  style: z.enum(linkDisplayStyles),
  /** Item whose children can be potentially shown */
  parentItem: validate.itemId,
});

/** Backlinks from another group of items to this item */
export type BacklinksSection = z.infer<typeof BacklinksSectionStruct>;

async function validateBacklinksSection(itemId: ItemId, data: BacklinksSection) {
  if (!await itemExists(data.parentItem)) {
    error(400, `Backlink parent item ${data.parentItem} does not exist`);
  }
}

/** Package information section */
const PackageSectionStruct = z.strictObject({
  /** The type of section (in this case 'package') */
  type: z.literal('package'),
  /** The text to display for the section (defaults to "Install using [provider]") */
  label: validate.name.nullable(),
  /** The URL of the site being linked */
  info: PackageInfoStruct,
});

/** Package information section */
export type PackageSection = z.infer<typeof PackageSectionStruct>;

/** Code repository link */
const RepoSectionStruct = z.strictObject({
  /** The type of section (in this case 'repo') */
  type: z.literal('repo'),
  /** The text to display for the section (defaults to "View the code on [provider]") */
  label: validate.name.nullable(),
  /** Information about the repository being linked */
  info: RepoInfo,
});

/** Code repository link */
export type RepoSection = z.infer<typeof RepoSectionStruct>;

/** Website link */
const SiteSectionStruct = z.strictObject({
  /** The type of section (in this case 'site') */
  type: z.literal('site'),
  /** The icon to display for the section (defaults to "la-globe") */
  icon: z.string().nullable(),
  /** The text to display for the section (defaults to "Visit the website") */
  label: validate.name.nullable(),
  /** The URL of the site being linked */
  url: z.httpUrl(),
});

/** Website link */
export type SiteSection = z.infer<typeof SiteSectionStruct>;

/** Website link */
const FeedSectionStruct = z.strictObject({
  /** The type of section (in this case 'site') */
  type: z.literal('feed'),
  /** The icon to display for the section (defaults to "la-globe") */
  icon: z.string().nullable(),
  /** The text to display for the section (defaults to "Subscribe via RSS/Atom") */
  label: validate.name.nullable(),
});

/** Website link */
export type FeedSection = z.infer<typeof FeedSectionStruct>;

/** File download */
const DownloadSectionStruct = z.strictObject({
  /** The type of section (in this case 'download') */
  type: z.literal('download'),
  /** The file-name of the file that should be downloaded */
  file: z.string(),
  /** The text to display for the section (defaults to "Download") */
  label: z.string().nullable(),
});

/** File download */
export type DownloadSection = z.infer<typeof DownloadSectionStruct>;

/** A section on the item page */
export const ItemSectionStruct = z.discriminatedUnion('type', [
  HeadingSection,
  LinksSection,
  BacklinksSectionStruct,
  PackageSectionStruct,
  RepoSectionStruct,
  SiteSectionStruct,
  FeedSectionStruct,
  DownloadSectionStruct,
]);

/** A section on the item page */
export type ItemSection = z.infer<typeof ItemSectionStruct>;

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
    case 'download':
      await validateFile(itemId, data.file);
      break;
  }
}
