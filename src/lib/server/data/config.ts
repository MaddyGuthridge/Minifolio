import { readFile, writeFile } from 'node:fs/promises';
import { array, nullable, object, string, validate, type Infer } from 'superstruct';
import { getDataDir } from './dataDir';
import { version } from '$app/environment';
import { unsafeLoadConfig } from './migrations/unsafeLoad';

/** Path to config.json */
const CONFIG_JSON = () => `${getDataDir()}/config.json`;

/** Validator for config.json file */
export const ConfigJsonStruct = object({
  /** Filename of icon to use for the site */
  siteIcon: nullable(string()),
  /** Links to place in `<link rel="me" href="{}">` fields */
  relMe: array(string()),
  /** Version of server that last accessed the config.json */
  version: string(),
});

/** Main configuration for the portfolio, `config.json` */
export type ConfigJson = Infer<typeof ConfigJsonStruct>;

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

  // Validate data
  const [err, parsed] = validate(JSON.parse(data), ConfigJsonStruct);
  if (err) {
    console.log('Error while parsing config.json');
    console.error(err);
    throw err;
  }

  return parsed;
}

/** Update the configuration, stored in `/data/config.json` */
export async function setConfig(newConfig: ConfigJson) {
  await writeFile(CONFIG_JSON(), JSON.stringify(newConfig, undefined, 2));
}

/** Set up the default server configuration */
export async function initConfig() {
  await setConfig({
    siteIcon: null,
    relMe: [],
    version,
  });
}
