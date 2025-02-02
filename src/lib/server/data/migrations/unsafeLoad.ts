/** Unsafely load data, so that types are not checked */
import type { ItemId } from '$lib/itemId';
import fs from 'fs/promises';

/** Load old config.json */
export async function unsafeLoadConfig(dataDir: string): Promise<object> {
  return JSON.parse(await fs.readFile(`${dataDir}/config.json`, { encoding: 'utf-8' })) as object;
}

/** Load old config.local.json */
export async function unsafeLoadLocalConfig(privateDataDir: string): Promise<object> {
  return JSON.parse(await fs.readFile(`${privateDataDir}/config.local.json`, { encoding: 'utf-8' })) as object;
}

/** Load item info in old format */
export async function unsafeLoadItemInfo(dataDir: string, itemId: ItemId): Promise<object> {
  return JSON.parse(await fs.readFile(`${dataDir}${itemId}/info.json`, { encoding: 'utf-8' })) as object;
}
