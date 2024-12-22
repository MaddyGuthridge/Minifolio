import { getDataDir } from '$lib/server/data/dataDir';
import type { ItemInfo } from '$lib/server/data/item';
import fs from 'fs/promises';
import path from 'path';

export async function getInfo(item: ItemId): Promise<ItemInfo> {
  // Currently load from the disk every time -- should implement caching at some point
  const result = JSON.parse(await fs.readFile(path.join(getDataDir(), ...item, 'info.json'), { encoding: 'utf-8' }));
  return result as ItemInfo;
}

export async function setInfo(item: ItemId, info: any) {
  // TODO: Validate and save new info.json
}
