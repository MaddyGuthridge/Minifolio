import api from '$endpoints';
import { getDataDir, getPrivateDataDir } from '$lib/server/data/dataDir';
import { unzip } from '$lib/server/zip';
import { rm } from 'node:fs/promises';

/** Extract the given zip file into the data dir, then refresh the data to trigger a migration */
export async function migrateDataFromZip(zipFile: string) {
  await rm(getDataDir(), { recursive: true, force: true });
  await unzip(zipFile, getDataDir());
  await api().debug.dataRefresh();
}

/**
 * Extract the given zip file into the private data dir, then refresh the data to trigger a
 * migration.
 */
export async function migratePrivateDataFromZip(zipFile: string) {
  await rm(getPrivateDataDir(), { recursive: true, force: true });
  await unzip(zipFile, getPrivateDataDir());
  await api().debug.dataRefresh();
}
