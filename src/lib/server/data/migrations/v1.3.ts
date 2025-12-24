import itemId, { type ItemId } from '$lib/itemId';
import { iterItems, setItemInfo, type ItemInfo } from '../item';
import { bumpDataVersion, bumpPrivateDataVersion } from './shared';
import { unsafeLoadItemInfo } from './unsafeLoad';

export async function migratePrivateV13(privateDataDir: string) {
  // Update `config.local.json`
  console.log('config.local.json');
  await bumpPrivateDataVersion(privateDataDir);
}

export async function migrateDataV13(dataDir: string) {
  console.log('config.json');
  await bumpDataVersion(dataDir);
  for await (const item of iterItems(itemId.ROOT)) {
    await updateItemData(dataDir, item);
  }
}

async function updateItemData(dataDir: string, item: ItemId) {
  const itemInfo = await unsafeLoadItemInfo(dataDir, item) as ItemInfo;
  if (itemInfo.author !== null) {
    itemInfo.author.fediverse = null;
  }
  await setItemInfo(item, itemInfo);
}
