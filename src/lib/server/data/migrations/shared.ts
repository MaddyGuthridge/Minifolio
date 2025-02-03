/**
 * Shared helper functions for common data migration actions.
 */
import { version } from '$app/environment';
import { setConfig, type ConfigJson } from '../config';
import { setLocalConfig, type ConfigLocalJson } from '../localConfig';
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

/** Bump data version. Only used for minor updates with no actual changes. */
export async function bumpDataVersion(dataDir: string) {
  const config = await unsafeLoadConfig(dataDir) as ConfigJson;
  config.version = version;
  await setConfig(config);
}

/** Bump private data version. Only used for minor updates with no actual changes. */
export async function bumpPrivateDataVersion(dataDir: string) {
  const config = await unsafeLoadLocalConfig(dataDir) as ConfigLocalJson;
  config.version = version;
  await setLocalConfig(config);
}
