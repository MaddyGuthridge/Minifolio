/**
 * Shared helper functions for common data migration actions.
 */
import { version } from '$app/environment';
import { getConfig, setConfig, type ConfigJson } from '../config';
import { getLocalConfig, setLocalConfig } from '../localConfig';
import { authIsSetUp } from '../dataDir';
import { unsafeLoadConfig, unsafeLoadLocalConfig } from './unsafeLoad';

/** Returns the version of the data */
export async function getDataVersion(dataDir: string): Promise<string> {
  const configJson = await unsafeLoadConfig(dataDir) as ConfigJson;
  return configJson.version;
}

/** Returns the version of the data */
export async function getPrivateDataVersion(privateDataDir: string): Promise<string> {
  const configLocalJson = await unsafeLoadLocalConfig(privateDataDir) as ConfigJson;
  return configLocalJson.version;
}

/** Update config versions (only for minor, non-breaking changes to config.json) */
export async function updateConfigVersions() {
  const config = await getConfig();
  config.version = version;
  await setConfig(config);
  // Only migrate local config if it is created
  if (await authIsSetUp()) {
    const configLocal = await getLocalConfig();
    configLocal.version = version;
    await setLocalConfig(configLocal);
  }
}
