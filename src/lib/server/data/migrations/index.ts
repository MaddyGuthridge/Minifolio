import { version } from '$app/environment';
import { getConfig, setConfig } from '../config';
import { getDataDir } from '../dataDir';
import { getLocalConfig, setLocalConfig } from '../localConfig';
import migrateV010 from './v0.1.0';
import migrateV020 from './v0.2.0';
import migrateV030 from './v0.3.0';
import semver from 'semver';

export type MigrationFunction = (dataDir: string) => Promise<void>;

/** Lookup table of migrations */
const migrations: Record<string, MigrationFunction> = {
  '~0.1.0': migrateV010,
  '~0.2.0': migrateV020,
  '~0.3.0': migrateV030,
  '~0.4.0': updateConfigVersions,
};

/** Update config versions (only for minor, non-breaking changes to config.json) */
export async function updateConfigVersions(dataDir: string) {
  const config = await getConfig();
  config.version = version;
  await setConfig(config);
  const configLocal = await getLocalConfig();
  configLocal.version = version;
  await setLocalConfig(configLocal);
}

/** Perform a migration from the given version */
export default async function migrate(oldVersion: string) {
  console.log(`Data directory uses version ${oldVersion}. Migration needed`);

  for (const [versionRange, migrateFunction] of Object.entries(migrations)) {
    if (semver.satisfies(oldVersion, versionRange)) {
      // TODO: In future, perhaps we should copy the data to a temporary
      // location before performing the migration to avoid data destruction
      // if things don't go according to plan.
      // This may require checking to ensure all data is loaded from the given
      // data dir by migrate functions (eg `updateConfigVersions` currently
      // calls getConfig and getLocalConfig without specifying the desired
      // directory to load from).
      try {
        await migrateFunction(getDataDir());
        console.log('Migration success');
        return;
      } catch (e) {
        console.log('!!! Error during migration');
        console.log(e);
        throw e;
      }
    }
  }
  const msg = `Unable to perform data migration, as version ${oldVersion} does not have a migrate function for ${version}`;
  console.log(msg);
  throw new Error(msg);
}
