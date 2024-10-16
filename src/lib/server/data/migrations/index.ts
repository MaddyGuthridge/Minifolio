import { version } from '$app/environment';
import { getDataDir, getPrivateDataDir } from '../dataDir';
import { updateConfigVersions } from './shared';
import migrateToV020 from './v0.2.0';
import migrateToV030 from './v0.3.0';
import migrateToV040 from './v0.4.0';
import migrateToV060 from './v0.6.0';
import semver from 'semver';


export type MigrationFunction = (
  dataDir: string,
  privateDataDir: string,
) => Promise<void>;

/** Lookup table of migrations */
const migrations: Record<string, MigrationFunction> = {
  '~0.1.0': migrateToV020,
  '~0.2.0': migrateToV030,
  '~0.3.0': migrateToV040,
  // No major changes to data format between 0.4 and 0.5, so just use the 0.5
  // function
  '~0.4.0': migrateToV060,
  '~0.5.0': migrateToV060,
  // Pre-empt future releases
  '~0.6.0': updateConfigVersions,
};

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
        await migrateFunction(getDataDir(), getPrivateDataDir());
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
