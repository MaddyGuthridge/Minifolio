import { version } from '$app/environment';
import itemId, { type ItemId } from '$lib/itemId';
import { unixTime } from '$lib/util';
import { setConfig, type ConfigJson } from '../config';
import { iterItems, setItemInfo, type ItemInfo } from '../item';
import { bumpPrivateDataVersion } from './shared';
import { unsafeLoadConfig, unsafeLoadItemInfo } from './unsafeLoad';

export async function migratePrivateV11(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await bumpPrivateDataVersion(privateDataDir);
}

export async function migrateDataV11(dataDir: string) {
  console.log('config.json');
  await updatePublicConfig(dataDir);
  for await (const item of iterItems(itemId.ROOT)) {
    await updateItemData(dataDir, item);
  }
}

/** Update `config.json` */
async function updatePublicConfig(dataDir: string) {
  const config = await unsafeLoadConfig(dataDir) as ConfigJson;
  // Add additional verification properties
  config.verification.bing = null;
  config.verification.google = null;
  // Bump version
  config.version = version;
  await setConfig(config);
}

async function updateItemData(dataDir: string, item: ItemId) {
  const itemInfo = await unsafeLoadItemInfo(dataDir, item) as ItemInfo;
  itemInfo.author = null;
  // Easier than looking up file metadata
  itemInfo.timeCreated = unixTime();
  itemInfo.timeEdited = unixTime();
  itemInfo.article = false;
  itemInfo.feed = null;
  await setItemInfo(item, itemInfo);
}
