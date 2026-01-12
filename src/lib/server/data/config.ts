import { readFile, writeFile } from 'node:fs/promises';
import z from 'zod';
import { getDataDir } from './dataDir';
import { version } from '$app/environment';
import { unsafeLoadConfig } from './migrations/unsafeLoad';
import { IdVerificationStruct } from './idVerification';

/** Path to config.json */
const CONFIG_JSON = () => `${getDataDir()}/config.json`;

/** Validator for config.json file */
export const ConfigJson = z.strictObject({
  /** Filename of icon to use for the site */
  siteIcon: z.string().nullable(),
  /** Identity verification */
  verification: IdVerificationStruct,
  /** Version of server that last accessed the config.json */
  version: z.string(),
});

/** Main configuration for the portfolio, `config.json` */
export type ConfigJson = z.infer<typeof ConfigJson>;

/**
 * Return the version of the configuration. Used to determine if a migration is
 * necessary.
 *
 * This does not validate any of the data.
 */
export async function getConfigVersion(): Promise<string> {
  const data = await unsafeLoadConfig(getDataDir()) as { version?: string };

  // Note: v0.1.0 did not have a version number in the file
  return data.version ?? '0.1.0';
}

/** Return the configuration, stored in `/data/config.json` */
export async function getConfig(): Promise<ConfigJson> {
  const data = await readFile(CONFIG_JSON(), { encoding: 'utf-8' });
  return ConfigJson.parse(JSON.parse(data));
}

/** Update the configuration, stored in `/data/config.json` */
export async function setConfig(newConfig: ConfigJson) {
  await writeFile(CONFIG_JSON(), JSON.stringify(newConfig, undefined, 2));
}

/** Set up the default server configuration */
export async function initConfig() {
  await setConfig({
    siteIcon: null,
    verification: {
      relMe: [],
      atProtocol: null,
      google: null,
      bing: null,
    },
    version,
  });
}
