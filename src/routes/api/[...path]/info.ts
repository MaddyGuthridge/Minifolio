import { getDataDir } from '$lib/server/data/dataDir';
import { getItemInfo, ItemInfoStruct, type ItemInfo } from '$lib/server/data/item';
import type { ItemId } from '$lib/server/data/itemId';
import { applyStruct } from '$lib/server/util';
import fs from 'fs/promises';
import path from 'path';

export function getInfo(item: ItemId): Promise<ItemInfo> {
  return getItemInfo(item);
}

export async function setInfo(item: ItemId, data: any): Promise<void> {
}
