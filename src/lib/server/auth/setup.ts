/**
 * Code managing the setup of the auth system of Minifolio.
 */
import { setLocalConfig, type ConfigLocalJson } from '../data/localConfig';
import { version } from '$app/environment';
import { hashAndSalt } from './passwords';
import { nanoid } from 'nanoid';
import { unixTime } from '$lib/util';
import { generateToken } from './tokens';
import type { Cookies } from '@sveltejs/kit';
import { generateAuthSecret } from './secret';
import { runningInDocker } from '../machine';
import { generateKey } from '../keys';

/**
 * Set up auth information.
 *
 * This is responsible for:
 *
 * 1. Setting up the auth secret
 * 2. Creating the first account
 * 3. Storing the auth info info the local config
 * 4. In Docker, ensuring that the system has an SSH key
 */
export async function authSetup(
  username: string,
  password: string,
  cookies?: Cookies,
): Promise<string> {
  // 1. Set up the auth secret
  await generateAuthSecret();

  // 2. Create the user
  const userId = nanoid();

  // Generate a salt for the password
  // Using nanoid for secure generation
  const salt = nanoid();
  const passwordHash = hashAndSalt(salt, password);

  // Set up auth config
  const config: ConfigLocalJson = {
    auth: {
      [userId]: {
        username,
        password: {
          hash: passwordHash,
          salt: salt,
        },
        sessions: {
          notBefore: unixTime(),
          revokedSessions: {},
        },
      },
    },
    enableFail2ban: false,
    loginBannedIps: {},
    bannedIps: [],
    bannedUserAgents: [],
    allowCloudflareIp: false,
    keyPath: null,
    gitConfig: {
      userName: null,
      userEmail: null,
    },
    version,
  };
  await setLocalConfig(config);

  // Now that basic config is set up, if we're running in Docker, ensure that we have a valid SSH
  // key (since system SSH will be unavailable).
  if (await runningInDocker()) {
    await generateKey();
  }

  return generateToken(userId, cookies);
}
