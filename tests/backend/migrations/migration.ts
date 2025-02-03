import api from '$endpoints';
import { getDataDir, getPrivateDataDir } from '$lib/server/data/dataDir';
import { unzip } from '$lib/server/zip';
import { rimraf } from 'rimraf';

/** Extract the given zip file into the data dir, then refresh the data to trigger a migration */
export async function migrateDataFromZip(zipFile: string) {
  await rimraf(getDataDir());
  await unzip(zipFile, getDataDir());
  await api().debug.dataRefresh();
}

/**
 * Extract the given zip file into the private data dir, then refresh the data to trigger a
 * migration.
 */
export async function migratePrivateDataFromZip(zipFile: string) {
  await rimraf(getPrivateDataDir());
  await unzip(zipFile, getPrivateDataDir());
  await api().debug.dataRefresh();
}
