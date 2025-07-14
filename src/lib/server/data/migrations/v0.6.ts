import { version } from '$app/environment';
import itemId, { type ItemId } from '$lib/itemId';
import { readdir } from 'node:fs/promises';
import { setConfig } from '../config';
import { setItemInfo } from '../item';
import type { PackageInfo } from '../item/package';
import type { RepoInfo, RepoProvider } from '../item/repo';
import type { ItemSection, LinksSection, PackageSection, RepoSection, SiteSection } from '../item/section';
import { setLocalConfig, type ConfigLocalJson } from '../localConfig';
import { unsafeLoadConfig, unsafeLoadItemInfo, unsafeLoadLocalConfig } from './unsafeLoad';
import { unixTime } from '$lib/util';

export async function migratePrivateV06(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await updateLocalConfig(privateDataDir);
}

export async function migrateDataV06(dataDir: string) {
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

  for (const groupId of groups) {
    console.log(`Group: /${groupId}`);

    // Don't bother making the migration code fully parallel, since it only runs once for an
    // instance and is fast enough as-is.
    // eslint-disable-next-line no-await-in-loop
    const items = (await readdir(`${dataDir}/${groupId}`, { withFileTypes: true }))
      // Only keep directories
      .filter(d => d.isDirectory())
      .map(d => d.name);

    // For each item
    for (const oldItemId of items) {
      const newItemId = itemId.fromComponents([groupId, oldItemId]);
      console.log(`Item: ${newItemId}`);
      // Update each item
      // eslint-disable-next-line no-await-in-loop
      await updateItemInfo(dataDir, newItemId);
    }
    // Update group
    const newItemId = itemId.fromComponents([groupId]);
    console.log(`Item: ${newItemId}`);
    // eslint-disable-next-line no-await-in-loop
    await groupToItem(dataDir, newItemId);
  }

  console.log('Success');
}

async function updateLocalConfig(privateDataDir: string) {
  const oldConfig = await unsafeLoadLocalConfig(privateDataDir) as ConfigLocalJson;
  // Git config
  const gitConfig = {
    userName: null,
    userEmail: null,
  };
  oldConfig.gitConfig = gitConfig;
  // Version
  oldConfig.version = version;
  await setLocalConfig(oldConfig);
}

/** Update `config.json` */
async function updatePublicConfig(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);
  await setConfig({
    version,
    verification: {
      relMe: [],
      atProtocol: null,
      google: null,
      bing: null,
    },
    siteIcon: oldConfig.siteIcon,
  });
}

/** Convert root `config.json` into `info.json` */
async function createRootItem(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);

  await setItemInfo(itemId.ROOT, {
    name: oldConfig.siteName,
    shortName: oldConfig.siteShortName,
    author: null,
    description: '',
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: 'README.md',
    feed: null,
    article: false,
    icon: null,
    banner: null,
    color: oldConfig.color,
    sections: [],
    children: oldConfig.listedGroups,
    filters: [],
    seo: {
      description: oldConfig.siteDescription ?? null,
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
    author: null,
    description: groupInfo.description,
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: 'README.md',
    feed: null,
    article: false,
    icon: groupInfo.icon,
    banner: groupInfo.banner,
    color: groupInfo.color,
    sections: [],
    children: groupInfo.listedItems,
    filters: groupInfo.filterGroups.map((g: string) => itemId.fromComponents([g])),
    seo: {
      description: groupInfo.pageDescription ?? null,
      keywords: groupInfo.keywords,
    },
  });
}

async function updateItemInfo(dataDir: string, item: ItemId) {
  const itemInfo: any = await unsafeLoadItemInfo(dataDir, item);

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
    author: null,
    description: itemInfo.description,
    timeCreated: unixTime(),
    timeEdited: unixTime(),
    readme: 'README.md',
    article: false,
    feed: null,
    icon: itemInfo.icon,
    banner: itemInfo.banner,
    color: itemInfo.color,
    sections,
    children: [],
    filters: [],
    seo: {
      description: itemInfo.pageDescription ?? null,
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
