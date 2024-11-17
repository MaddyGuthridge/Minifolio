/**
 * Migration from v0.1.0 to v0.2.0
 *
 * Since this will likely only be used by me, it probably won't be all that
 * reliable.
 *
 * # Instructions
 *
 * 1. Ensure your data is backed up to a git repo
 * 2. Remove the data directory to reset the server
 * 3. Set up the server using the git repo URL
 * 4. Note the new auth information
 *
 * # Incompatible data
 *
 * Some data is lost in this migration (mainly because I couldn't be bothered
 * to implement anything more than the minimum).
 *
 * * `README.md` is clobbered by `info.md`.
 */

import fs from 'fs/promises';
import { setConfig, type ConfigJson } from '../config';
import { listGroups, setGroupInfo } from '../group';
import type { RepoInfo } from '../itemRepo';
import type { PackageInfo } from '../itemPackage';
import { LinksArray, listItems, setItemInfo } from '../itemOld';
import type { Infer } from 'superstruct';
import { version } from '$app/environment';
import { capitalize } from '$lib/util';
import { unsafeLoadConfig, unsafeLoadGroupInfo, unsafeLoadItemInfo } from './unsafeLoad';

type OldConfig = { name: string }

type OldItemInfo = {
  name: string;
  description: string;
  color: string;
  /** External links (not internal associative links) */
  links?: {
    repo?: RepoInfo;
    site?: string;
    docs?: string;
  };
  /** Internal (associative) links */
  associations: Record<string, string[]>;
  icon?: string;
  banner?: string;
  package?: PackageInfo;
  visibility?: 'filtered';
  sort?: number;
}

/** How to display links within a group */
type GroupLinkDisplayOptions = {
  title: string;
  display: 'card' | 'chip';
  reverseLookup: boolean;
}

type OldGroupInfo = {
  name: string;
  description: string;
  color: string;
  associations?: Record<string, GroupLinkDisplayOptions>;
}

/** Minimal representation of old global data */
type OldGlobals = {
  config: OldConfig,
  groups: Record<string, OldGroupInfo>,
  items: Record<string, Record<string, OldItemInfo>>,
}

export default async function migrate(dataDir: string) {
  console.log(`Begin data migration v0.1.0 -> ${version}`);

  // Load all data in
  const globals: OldGlobals = {
    config: await loadOldConfig(dataDir),
    groups: {},
    items: {},
  };

  // For each group
  for (const groupId of await listGroups()) {
    // Migrate the group info
    globals.groups[groupId] = await loadOldGroupInfo(dataDir, groupId);
    globals.items[groupId] = {};
    // Then migrate each item
    for (const itemId of await listItems(groupId)) {
      globals.items[groupId][itemId] = await loadOldItemInfo(dataDir, groupId, itemId);
    }
  }

  // For each group
  for (const groupId of Object.keys(globals.groups)) {
    // Migrate the group info
    await migrateGroupInfo(globals, groupId);
    // Then migrate each item
    for (const itemId of Object.keys(globals.items[groupId])) {
      await migrateItemInfo(globals, groupId, itemId);
    }
  }

  await migrateConfig(dataDir);
  await migrateReadme(dataDir);
  // // Set up gitignore
  // console.log('  .gitignore');
  // await setupGitignore();
  console.log('Data migration complete!');
}

/** Load old config.json */
async function loadOldConfig(dataDir: string): Promise<OldConfig> {
  return await unsafeLoadConfig(dataDir) as OldConfig;
}

/** Load item info in old format */
async function loadOldItemInfo(dataDir: string, groupId: string, itemId: string): Promise<OldItemInfo> {
  return await unsafeLoadItemInfo(dataDir, groupId, itemId) as OldItemInfo;
}

/** Load group info in old format */
async function loadOldGroupInfo(dataDir: string, groupId: string): Promise<OldGroupInfo> {
  return await unsafeLoadGroupInfo(dataDir, groupId) as OldGroupInfo;
}

/** Migrate config.json */
async function migrateConfig(dataDir: string) {
  console.log('  config.json');
  const oldConfig = await loadOldConfig(dataDir);

  const groupsList = await listGroups();

  const newConfig: ConfigJson = {
    siteName: oldConfig.name,
    siteShortName: oldConfig.name,
    siteDescription: '',
    siteKeywords: ['Portfolio'],
    siteIcon: null,
    // Assumes that all groups are visible, since there is no visibility
    // setting for groups in 0.1.0
    listedGroups: groupsList,
    color: '#ffaaff',
    version: '0.2.0',
  };

  await setConfig(newConfig);
}

/** Migrate info.md -> README.md */
async function migrateReadme(dataDir: string) {
  console.log('  info.md -> README.md');
  await fs.unlink(`${dataDir}/README.md`);
  await fs.rename(`${dataDir}/info.md`, `${dataDir}/README.md`);
}

/** Migrate item info to new format */
async function migrateItemInfo(globals: OldGlobals, groupId: string, itemId: string) {
  console.log(`  Item: ${groupId}/${itemId}`);

  const item = globals.items[groupId][itemId];

  const links: Infer<typeof LinksArray> = [];
  const group = globals.groups[groupId];

  if (item.associations) {
    for (const linkedGroup of Object.keys(item.associations)) {
      links.push([
        {
          groupId: linkedGroup,
          // Determine title and style from group options if possible
          title: groupLinkPropertyOr(group, linkedGroup, 'title', capitalize(linkedGroup)),
          style: groupLinkPropertyOr(group, linkedGroup, 'display', 'chip'),
        },
        // If reverse-lookup is enabled for the associations, use that
        groupLinkPropertyOr(group, linkedGroup, 'reverseLookup', false)
          ? findReverseLinks(globals, groupId, itemId, linkedGroup)
          : item.associations[linkedGroup]
      ]);
    }
  }

  // Also set up associations for groups
  if (group.associations) {
    for (const linkedGroup of Object.keys(group.associations)) {
      if (groupLinkPropertyOr(group, linkedGroup, 'reverseLookup', false)) {
        links.push([
          {
            groupId: linkedGroup,
            // Determine title and style from group options if possible
            title: groupLinkPropertyOr(group, linkedGroup, 'title', capitalize(linkedGroup)),
            style: groupLinkPropertyOr(group, linkedGroup, 'display', 'chip'),
          },
          // Find reverse links
          findReverseLinks(globals, groupId, itemId, linkedGroup)
        ]);
      }
    }
  }

  await setItemInfo(groupId, itemId, {
    name: item.name,
    description: item.description,
    pageDescription: '',
    keywords: [item.name],
    color: item.color,
    icon: item.icon ?? null,
    banner: item.banner ?? null,
    links,
    urls: {
      repo: item.links?.repo ?? null,
      site: item.links?.site ?? null,
      docs: item.links?.docs ?? null,
    },
    package: item.package ?? null,
  });
}

/**
 * Returns the given property value for the given linked group if possible,
 * otherwise returns the fallback value.
 */
function groupLinkPropertyOr<T extends keyof GroupLinkDisplayOptions>(
  group: OldGroupInfo,
  linkedGroup: string,
  property: T,
  fallback: GroupLinkDisplayOptions[T],
): GroupLinkDisplayOptions[T] {
  return group.associations?.[linkedGroup]
    ? group.associations[linkedGroup][property]
    : fallback;
}

/** Returns all items within the given linkedGroup that link to the given item */
function findReverseLinks(
  globals: OldGlobals,
  groupId: string,
  itemId: string,
  linkedGroup: string
): string[] {
  const reverseLinks = [];

  for (const [linkedItemId, item] of Object.entries(globals.items[linkedGroup])) {
    if (item.associations?.[groupId]?.includes(itemId)) {
      reverseLinks.push(linkedItemId);
    }
  }

  return reverseLinks;
}

async function migrateGroupInfo(globals: OldGlobals, groupId: string) {
  console.log(`  Group: ${groupId}`);

  const group = globals.groups[groupId];

  await setGroupInfo(groupId, {
    name: group.name,
    description: group.description,
    pageDescription: '',
    keywords: [group.name],
    color: group.color,
    icon: null,
    banner: null,
    // Filter using all groups except for this one
    filterGroups: Object.keys(globals.groups).filter(g => g !== groupId),
    // List all items, and sort them based on the given sort value
    listedItems: Object.keys(globals.items[groupId]).toSorted(
      (i1, i2) => (globals.items[groupId][i1].sort ?? 0) - (globals.items[groupId][i2].sort ?? 0)
    ).toReversed(),
    // Use all items for filtering where the visibility setting isn't "filtered"
    filterItems: Object.keys(globals.items[groupId]).filter(i => globals.items[groupId][i].visibility !== 'filtered'),
  });
}
