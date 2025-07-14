import { readFile, writeFile } from 'node:fs/promises';
import { array, boolean, nullable, number, object, record, string, union, validate, type Infer } from 'superstruct';
import { getPrivateDataDir } from './dataDir';
import { GitConfigStruct } from '../git';

/** Path to config.local.json */
const CONFIG_LOCAL_JSON = () => `${getPrivateDataDir()}/config.local.json`;

/**
 * Validator for config.local.json file
 */
export const ConfigLocalJsonStruct = object({
  /**
   * Authentication data, as a record between user IDs and their
   * authentication info.
   */
  auth: record(string(), object({
    /** The user's username, used for logging in */
    username: string(),
    /** Information about the user's password */
    password: object({
      /** Hash of password */
      hash: string(),
      /** Salt of password */
      salt: string(),
    }),
    /**
     * Information about sessions for this user.
     *
     * Sessions should be implemented using a JWT, where each session has a
     * unique session ID, and an expiry time.
     */
    sessions: object({
      /**
       * Don't accept tokens issued before this unix timestamp.
       *
       * This is used to revoke all tokens, we can just update this value to
       * be the current time, which will cause all sessions to become invalid.
       */
      notBefore: number(),
      /**
       * Mapping of revoked sessions.
       *
       * Each key is the session ID, each value is the timestamp that it
       * would actually expire at (used for cleaning the data, so we can remove
       * sessions that have expired).
       */
      revokedSessions: record(string(), number()),
    }),
  })),
  /**
   * Whether to enable fail2ban, where IP addresses that fail to log in are
   * banned.
   *
   * If this is set to `true`, the server will store an array of timestamps for
   * login fails for incoming IP addresses, and if that IP has a login failure
   * too often, it will be banned from attempting to log in temporarily.
   */
  enableFail2ban: boolean(),
  /**
   * A mapping of IP addresses to the array of their most recent login fail
   * timestamps, or a boolean indicating whether they are permanently banned
   * (`true`) or must never be banned (`false`).
   */
  loginBannedIps: record(string(), union([array(number()), boolean()])),
  /**
   * Array of banned IP addresses. All requests from these IP addresses will
   * be blocked.
   */
  bannedIps: array(string()),
  /**
   * Whether to allow determining incoming IP addresses using Cloudflare's
   * `CF-Connecting-IP` header. Only enable if running behind a Cloudflare
   * tunnel, otherwise the client's IP address can be faked.
   */
  allowCloudflareIp: boolean(),
  /**
   * Array of regular expressions matching user-agent strings which should be
   * blocked.
   */
  bannedUserAgents: array(string()),
  /** Git configuration */
  gitConfig: GitConfigStruct,
  /**
   * Path to the private key file which the server should use when connecting
   * to git repos.
   *
   * The public key file is expected to be the same as the private key, with a
   * `.pub` suffix.
   *
   * If this is `null`, then the `ssh` executable will be free to choose an
   * appropriate SSH key to use.
   */
  keyPath: nullable(string()),
  /** Version of server that last accessed the config.local.json */
  version: string(),
});

/** Type definition for config.local.json file */
export type ConfigLocalJson = Infer<typeof ConfigLocalJsonStruct>;

/** Return the local configuration, stored in `/private-data/config.local.json` */
export async function getLocalConfig(): Promise<ConfigLocalJson> {
  const data = await readFile(CONFIG_LOCAL_JSON(), { encoding: 'utf-8' });

  // Validate data
  const [err, parsed] = validate(JSON.parse(data), ConfigLocalJsonStruct);
  if (err) {
    console.log('Error while parsing config.local.json');
    console.error(err);
    throw err;
  }
  return parsed;
}

/** Update the local configuration, stored in `/data/config.local.json` */
export async function setLocalConfig(newConfig: ConfigLocalJson) {
  await writeFile(CONFIG_LOCAL_JSON(), JSON.stringify(newConfig, undefined, 2));
}
