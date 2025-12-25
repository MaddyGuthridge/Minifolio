import { readFile, writeFile } from 'node:fs/promises';
import z from 'zod';
import { getPrivateDataDir } from './dataDir';
import { GitConfig } from '../git';

/** Path to config.local.json */
const CONFIG_LOCAL_JSON = () => `${getPrivateDataDir()}/config.local.json`;

/**
 * Validator for config.local.json file
 */
export const ConfigLocalJson = z.strictObject({
  /**
   * Authentication data, as a record between user IDs and their
   * authentication info.
   */
  auth: z.record(z.string(), z.strictObject({
    /** The user's username, used for logging in */
    username: z.string(),
    /** Information about the user's password */
    password: z.object({
      /** Hash of password */
      hash: z.string(),
      /** Salt of password */
      salt: z.string(),
    }),
    /**
     * Information about sessions for this user.
     *
     * Sessions should be implemented using a JWT, where each session has a
     * unique session ID, and an expiry time.
     */
    sessions: z.strictObject({
      /**
       * Don't accept tokens issued before this unix timestamp.
       *
       * This is used to revoke all tokens, we can just update this value to
       * be the current time, which will cause all sessions to become invalid.
       */
      notBefore: z.number(),
      /**
       * Mapping of revoked sessions.
       *
       * Each key is the session ID, each value is the timestamp that it
       * would actually expire at (used for cleaning the data, so we can remove
       * sessions that have expired).
       */
      revokedSessions: z.record(z.string(), z.number()),
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
  enableFail2ban: z.boolean(),
  /**
   * A mapping of IP addresses to the array of their most recent login fail
   * timestamps, or a boolean indicating whether they are permanently banned
   * (`true`) or must never be banned (`false`).
   */
  loginBannedIps: z.record(z.string(), z.union([
    z.array(z.number()),
    z.boolean(),
  ])),
  /**
   * Array of banned IP addresses. All requests from these IP addresses will
   * be blocked.
   */
  bannedIps: z.array(z.string()),
  /**
   * Whether to allow determining incoming IP addresses using Cloudflare's
   * `CF-Connecting-IP` header. Only enable if running behind a Cloudflare
   * tunnel, otherwise the client's IP address can be faked.
   */
  allowCloudflareIp: z.boolean(),
  /**
   * Array of regular expressions matching user-agent strings which should be
   * blocked.
   */
  bannedUserAgents: z.array(z.string()),
  /** Git configuration */
  gitConfig: GitConfig,
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
  keyPath: z.nullable(z.string()),
  /** Version of server that last accessed the config.local.json */
  version: z.string(),
});

/** Type definition for config.local.json file */
export type ConfigLocalJson = z.infer<typeof ConfigLocalJson>;

/** Return the local configuration, stored in `/private-data/config.local.json` */
export async function getLocalConfig(): Promise<ConfigLocalJson> {
  const data = await readFile(CONFIG_LOCAL_JSON(), { encoding: 'utf-8' });
  return ConfigLocalJson.parse(JSON.parse(data));
}

/** Update the local configuration, stored in `/data/config.local.json` */
export async function setLocalConfig(newConfig: ConfigLocalJson) {
  await writeFile(CONFIG_LOCAL_JSON(), JSON.stringify(newConfig, undefined, 2));
}
