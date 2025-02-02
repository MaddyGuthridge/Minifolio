import { version } from '$app/environment';
import itemId, { type ItemId } from '$lib/itemId';
import { readdir } from 'fs/promises';
import { setConfig } from '../config';
import { setItemInfo } from '../item';
import type { PackageInfo } from '../item/package';
import type { RepoInfo, RepoProvider } from '../item/repo';
import type { ItemSection, LinksSection, PackageSection, RepoSection, SiteSection } from '../item/section';
import { setLocalConfig, type ConfigLocalJson } from '../localConfig';
import { unsafeLoadConfig, unsafeLoadItemInfo, unsafeLoadLocalConfig } from './unsafeLoad';

export default async function migrateFromV0_6(dataDir: string, privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await updateLocalConfig(privateDataDir);
  // Update `config.json`
  console.log('config.json');
  await updatePublicConfig(dataDir);
  // Convert old data to item `/`
  console.log('Item: /');
  await createRootItem(dataDir);

  // For each group
  const groups = (await readdir(dataDir, { withFileTypes: true }))
    // Only keep directories
    .filter(d => d.isDirectory())
    // .git isn't a valid group
    .filter(d => d.name !== '.git')
    .map(d => d.name);

  console.log('Discovered groups:', groups);

  for (const groupId of groups) {
    console.log(`Group: /${groupId}`);
    // For each item
    const items = (await readdir(`${dataDir}/${groupId}`, { withFileTypes: true }))
      // Only keep directories
      .filter(d => d.isDirectory())
      .map(d => d.name);

    console.log('Discovered items:', items);

    for (const oldItemId of items) {
      const newItemId = itemId.fromComponents([groupId, oldItemId]);
      console.log(`Item: ${newItemId}`);
      // Update each item
      await updateItemInfo(dataDir, newItemId);
    }
    // Update group
    const newItemId = itemId.fromComponents([groupId]);
    console.log(`Item: ${newItemId}`);
    await groupToItem(dataDir, newItemId);
  }

  console.log('Success');
}

async function updateLocalConfig(privateDataDir: string) {
  const oldConfig = await unsafeLoadLocalConfig(privateDataDir) as ConfigLocalJson;
  oldConfig.version = version;
  await setLocalConfig(oldConfig);
}

/** Update `config.json` */
async function updatePublicConfig(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);
  await setConfig({
    version,
    siteIcon: oldConfig.siteIcon,
  });
}

/** Convert root `config.json` into `info.json` */
async function createRootItem(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);

  await setItemInfo(itemId.ROOT, {
    name: oldConfig.siteName,
    shortName: oldConfig.siteShortName,
    description: '',
    icon: null,
    banner: null,
    color: oldConfig.color,
    sections: [],
    children: oldConfig.listedGroups,
    filters: [],
    seo: {
      description: oldConfig.siteDescription,
      keywords: oldConfig.siteKeywords,
    },
  });
}

/** Convert a group into an item */
async function groupToItem(dataDir: string, group: string) {
  const groupId = itemId.fromComponents([group]);
  const groupInfo: any = await unsafeLoadItemInfo(dataDir, groupId);
  await setItemInfo(groupId, {
    name: groupInfo.name,
    shortName: null,
    description: groupInfo.description,
    icon: groupInfo.icon,
    banner: groupInfo.banner,
    color: groupInfo.color,
    sections: [],
    children: groupInfo.listedItems,
    filters: groupInfo.filterGroups.map((g: string) => itemId.fromComponents([g])),
    seo: {
      description: groupInfo.pageDescription,
      keywords: groupInfo.keywords,
    },
  });
}

async function updateItemInfo(dataDir: string, item: ItemId) {
  const itemInfo: any = await unsafeLoadItemInfo(dataDir, item);

  console.log(itemInfo);

  // Add relevant sections
  const sections: ItemSection[] = [];

  // Links
  sections.push(...itemInfo.links.map(makeLinksSection));
  // Repo
  if (itemInfo.urls.repo !== null) {
    sections.push(makeRepoSection(itemInfo.urls.repo));
  }
  // Site
  if (itemInfo.urls.site !== null) {
    sections.push(makeSiteSection(itemInfo.urls.site));
  }
  // Docs
  if (itemInfo.urls.docs !== null) {
    sections.push(makeDocsSiteSection(itemInfo.urls.docs));
  }
  // Package
  if (itemInfo.package !== null) {
    sections.push(makePackageSection(itemInfo.package));
  }

  await setItemInfo(item, {
    name: itemInfo.name,
    shortName: null,
    description: itemInfo.description,
    icon: itemInfo.icon,
    banner: itemInfo.banner,
    color: itemInfo.color,
    sections,
    children: [],
    filters: [],
    seo: {
      description: itemInfo.pageDescription,
      keywords: itemInfo.keywords,
    },
  });
}

function makeSiteSection(url: string): SiteSection {
  return {
    type: 'site',
    icon: null,
    label: null,
    url,
  };
}

function makeDocsSiteSection(url: string): SiteSection {
  return {
    type: 'site',
    icon: 'lab la-readme',
    label: 'View the documentation',
    url,
  };
}

type OldRepoInfo = {
  provider: RepoProvider,
  path: string,
} | {
  title: string,
  url: string,
  icon?: string,
};

function makeRepoSection(info: OldRepoInfo): RepoSection {
  const newInfo: RepoInfo = 'provider' in info
    ? { provider: info.provider, path: info.path }
    : { provider: 'custom', title: info.title, subtitle: '', url: info.url, icon: info.icon ?? null };

  return {
    type: 'repo',
    label: null,
    info: newInfo,
  };
}

function makePackageSection(info: PackageInfo): PackageSection {
  return {
    type: 'package',
    label: null,
    info: info,
  };
}

type LinkItem = [
  { groupId: string, style: 'chip' | 'card', title: string },
  string[],
];

function makeLinksSection(info: LinkItem): LinksSection {
  const [{
    groupId,
    style,
    title,
  }, items] = info;

  return {
    type: 'links',
    label: title,
    style,
    items: items.map(linkedItemId => itemId.fromComponents([groupId, linkedItemId]))
  }
}
