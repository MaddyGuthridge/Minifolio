import { version } from '$app/environment';
import fs from 'fs/promises';
import { getDataDir, getPrivateDataDir } from '../dataDir';
import semver from 'semver';
import consts from '$lib/consts';
import path from 'path';
import migrateFromV0_6 from './v0.6';
import { getDataVersion } from './shared';
import { tmpdir } from 'os';


export type MigrationFunction = (
  dataDir: string,
  privateDataDir: string,
) => Promise<void>;

/** Lookup table of migrations */
const migrations: Record<string, MigrationFunction> = {
  // Pre-empt future releases
  '~0.6.1': migrateFromV0_6,
};

/** Perform a migration from the given version */
export default async function migrate() {
  const oldVersion = await getDataVersion(getDataDir());
  if (oldVersion === version) {
    return;
  }
  console.log(`Data directory uses version ${oldVersion}. Migration needed`);

  for (const [versionRange, migrateFunction] of Object.entries(migrations)) {
    if (semver.satisfies(oldVersion, versionRange)) {
      await performMigration(migrateFunction);
      return;
    }
  }
  const msg = `Unable to perform data migration, as version ${oldVersion} does not have a migrate function for ${version}`;
  console.log(msg);
  throw new Error(msg);
}

async function performMigration(migrateFunction: MigrationFunction) {
  // Make temporary directory with old data
  const temp = await fs.mkdtemp(path.join(tmpdir(), `${consts.APP_NAME}-migration-`));
  const tempData = path.join(temp, 'data');
  await fs.cp(getDataDir(), tempData, { recursive: true });
  const tempPrivate = path.join(temp, 'private');
  await fs.cp(getPrivateDataDir(), tempPrivate, { recursive: true });

  // Now perform the migration
  try {
    await migrateFunction(tempData, tempPrivate);
    console.log('Migration success');
    return;
  } catch (e) {
    console.log('!!! Error during migration');
    console.log(e);
    throw e;
  }
}
