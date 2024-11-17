/** Migration to v0.4.0 */

import { setConfig, type ConfigJson } from '../config';
import { listGroups, setGroupInfo, type GroupInfo } from '../group';
import { listItems, setItemInfo, type ItemInfoFull } from '../itemOld';
import { unsafeLoadConfig, unsafeLoadGroupInfo, unsafeLoadItemInfo } from './unsafeLoad';
import migrateV060 from './v0.6.0';

export default async function migrate(dataDir: string, privateDataDir: string) {
  await migrateConfig(dataDir);
  for (const groupId of await listGroups()) {
    await migrateGroup(dataDir, groupId);
    for (const itemId of await listItems(groupId)) {
      await migrateItem(dataDir, groupId, itemId);
    }
  }

  await migrateV060(dataDir, privateDataDir);
}

async function migrateConfig(dataDir: string) {
  const config = await unsafeLoadConfig(dataDir) as ConfigJson;
  // Add missing properties
  config.siteShortName = config.siteName;
  config.siteDescription = '';
  config.siteKeywords = ['Portfolio'];
  config.siteIcon = null;
  await setConfig(config);
}

async function migrateGroup(dataDir: string, groupId: string) {
  const info = await unsafeLoadGroupInfo(dataDir, groupId) as GroupInfo;
  // Add missing properties
  info.pageDescription = '';
  info.keywords = [info.name];
  await setGroupInfo(groupId, info);
}

async function migrateItem(dataDir: string, groupId: string, itemId: string) {
  const info = await unsafeLoadItemInfo(dataDir, groupId, itemId) as ItemInfoFull;
  // Add missing properties
  info.pageDescription = '';
  info.keywords = [info.name];
  await setItemInfo(groupId, itemId, info);
}
