import { version } from '$app/environment';
import fs from 'node:fs/promises';
import { authIsSetUp, dataIsSetUp, getDataDir, getPrivateDataDir } from '../dataDir';
import semver from 'semver';
import consts from '$lib/consts';
import path from 'node:path';
import { migrateDataV06, migratePrivateV06 } from './v0.6';
import { getDataVersion, getPrivateDataVersion, bumpDataVersion, bumpPrivateDataVersion } from './shared';
import { tmpdir } from 'node:os';


export type DataMigrationFunction = (
  dataDir: string,
) => Promise<void>;

export type PrivateMigrationFunction = (
  privateDataDir: string,
) => Promise<void>;

// Migrations for data
const dataMigrations: Record<string, DataMigrationFunction> = {
  // v0.6.x --> v1.0.0
  '~0.6.1': migrateDataV06,
  '~1.0.0': bumpDataVersion,
};

// Migrations for private data
const privateMigrations: Record<string, PrivateMigrationFunction> = {
  // v0.6.x --> v1.0.0
  '~0.6.1': migratePrivateV06,
  '~1.0.0': bumpPrivateDataVersion,
};

/** Perform a migration from the given version */
export async function migrateAll() {
  await migratePrivate();
  await migrateData();
}

// TODO: Fix this code duplication

export async function migrateData() {
  if (!await dataIsSetUp()) {
    return;
  }
  const oldVersion = await getDataVersion(getDataDir());
  if (oldVersion === version) {
    return;
  }
  console.log(`Data directory uses version ${oldVersion}. Migration needed`);

  for (const [versionRange, migrateFunction] of Object.entries(dataMigrations)) {
    if (semver.satisfies(oldVersion, versionRange)) {
      // The migration only runs once since we immediately return
      // eslint-disable-next-line no-await-in-loop
      await performDataMigration(migrateFunction);
      return;
    }
  }
  const msg = `Unable to perform data migration, as version ${oldVersion} does not have a migrate function for ${version}`;
  console.log(msg);
  throw new Error(msg);
}

export async function migratePrivate() {
  if (!await authIsSetUp()) {
    return;
  }
  const oldVersion = await getPrivateDataVersion(getPrivateDataDir());
  if (oldVersion === version) {
    return;
  }
  console.log(`Private data uses version ${oldVersion}. Migration needed`);

  for (const [versionRange, migrateFunction] of Object.entries(privateMigrations)) {
    if (semver.satisfies(oldVersion, versionRange)) {
      // The migration only runs once since we immediately return
      // eslint-disable-next-line no-await-in-loop
      await performPrivateMigration(migrateFunction);
      return;
    }
  }
  const msg = `Unable to perform data migration, as version ${oldVersion} does not have a migrate function for ${version}`;
  console.log(msg);
  throw new Error(msg);
}

async function performDataMigration(migrateFunction: DataMigrationFunction) {
  // Make temporary directory with old data
  const temp = await fs.mkdtemp(path.join(tmpdir(), `${consts.APP_NAME}-migration-`));
  const tempData = path.join(temp, 'data');
  await fs.cp(getDataDir(), tempData, { recursive: true });

  // Now perform the migration
  try {
    await migrateFunction(tempData);
    console.log('Migration success');
    return;
  } catch (e) {
    console.log('!!! Error during migration');
    console.log(e);
    throw e;
  }
}

async function performPrivateMigration(migrateFunction: PrivateMigrationFunction) {
  // Make temporary directory with old data
  const temp = await fs.mkdtemp(path.join(tmpdir(), `${consts.APP_NAME}-migration-`));
  const tempPrivate = path.join(temp, 'private');
  await fs.cp(getPrivateDataDir(), tempPrivate, { recursive: true });

  // Now perform the migration
  try {
    await migrateFunction(tempPrivate);
    console.log('Migration success');
    return;
  } catch (e) {
    console.log('!!! Error during migration');
    console.log(e);
    throw e;
  }
}
