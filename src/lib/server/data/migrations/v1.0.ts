import { version } from '$app/environment';
import itemId, { type ItemId } from '$lib/itemId';
import { unixTime } from '$lib/util';
import { setConfig } from '../config';
import { iterItems, setItemInfo, type ItemInfo } from '../item';
import { bumpPrivateDataVersion } from './shared';
import { unsafeLoadConfig, unsafeLoadItemInfo } from './unsafeLoad';

export async function migratePrivateV10(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await bumpPrivateDataVersion(privateDataDir);
}

export async function migrateDataV10(dataDir: string) {
  console.log('config.json');
  await updatePublicConfig(dataDir);
  for await (const item of iterItems(itemId.ROOT)) {
    await updateItemData(dataDir, item);
  }
}

/** Update `config.json` */
async function updatePublicConfig(dataDir: string) {
  const oldConfig: any = await unsafeLoadConfig(dataDir);
  await setConfig({
    version,
    verification: {
      relMe: oldConfig.relMe,
      atProtocol: null,
      google: null,
      bing: null,
    },
    siteIcon: oldConfig.siteIcon,
  });
}

async function updateItemData(dataDir: string, item: ItemId) {
  const itemInfo = await unsafeLoadItemInfo(dataDir, item) as ItemInfo;
  itemInfo.readme = 'README.md';
  itemInfo.author = null;
  itemInfo.timeCreated = unixTime();
  itemInfo.timeEdited = unixTime();
  itemInfo.article = false;
  itemInfo.feed = null;
  await setItemInfo(item, itemInfo);
}
