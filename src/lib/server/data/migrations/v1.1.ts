import itemId, { type ItemId } from '$lib/itemId';
import { unixTime } from '$lib/util';
import { iterItems, setItemInfo, type ItemInfo } from '../item';
import { bumpDataVersion, bumpPrivateDataVersion } from './shared';
import { unsafeLoadItemInfo } from './unsafeLoad';

export async function migratePrivateV11(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await bumpPrivateDataVersion(privateDataDir);
}

export async function migrateDataV11(dataDir: string) {
  console.log('config.json');
  await bumpDataVersion(dataDir);
  for await (const item of iterItems(itemId.ROOT)) {
    await updateItemData(dataDir, item);
  }
}

async function updateItemData(dataDir: string, item: ItemId) {
  const itemInfo = await unsafeLoadItemInfo(dataDir, item) as ItemInfo;
  // Easier than looking up file metadata
  itemInfo.timeCreated = unixTime();
  itemInfo.timeEdited = unixTime();
  itemInfo.article = false;
  itemInfo.rss = false;
  await setItemInfo(item, itemInfo);
}
