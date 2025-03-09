/**
 * Test cases for minor release migrations.
 *
 * For minor releases, there should be no changes to the data structure, aside from version bumps.
 * This test suite works by creating some data, then forcefully downgrading the `version` property
 * for `config.json` and `config.local.json` to a lower minor version number (if it is non-zero).
 *
 * Data migrations should work seamlessly.
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, expect, test } from 'vitest';
import { setup } from '../helpers';
import itemId from '$lib/itemId';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';
import { SemVer } from 'semver';
import { getConfig, setConfig } from '$lib/server/data/config';

let api: ApiClient;
let credentials: { username: string, password: string };

beforeEach(async () => {
  const data = await setup();
  api = data.api;
  credentials = { username: data.username, password: data.password };
});


function downgrade(version: string): string {
  const semver = new SemVer(version);
  semver.patch = 0;
  return semver.toString();
}

test('Private data is migrated correctly', async () => {
  const privateConfig = await getLocalConfig();
  privateConfig.version = downgrade(privateConfig.version);
  await setLocalConfig(privateConfig);
  // Now reload the data to force a migration
  await api.admin.data.refresh();
  // Logging in should still work, indicating that the data is valid
  await expect(api.admin.auth.login(credentials.username, credentials.password)).toResolve();
});

test('Public data is migrated correctly', async () => {
  const publicConfig = await getConfig();
  publicConfig.version = downgrade(publicConfig.version);
  await setConfig(publicConfig);
  // Now reload the data to force a migration
  await api.admin.data.refresh();
  // Getting info about root page should still work, indicating that data was migrated correctly
  await expect(api.item(itemId.ROOT).info.get()).toResolve();
});
