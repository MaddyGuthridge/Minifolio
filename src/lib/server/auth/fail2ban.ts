/**
 * A simple fail2ban implementation, which records the most recent `n` failed
 * login attempts for each IP address.
 */

import { unixTime } from '#lib/util.ts';
import { error } from '@sveltejs/kit';
import { getLocalConfig, setLocalConfig } from '../data/localConfig';

/**
 * The number of failed logins originating from an IP address required before
 * it is banned.
 */
const FAILS_UNTIL_BAN = 25;

/**
 * The duration for which a ban should last on an IP address.
 */
const BAN_DURATION = 60 * 60 * 24; // 24 hours

/** Filter expired failures from the list */
function filterExpiredLogs(failTimestamps: number[]): number[] {
  const time = unixTime();
  return failTimestamps.filter(t => t >= time - BAN_DURATION);
}

/** Returns whether the given IP address is banned from attempting logins */
export async function isIpBanned(ip: string) {
  const config = await getLocalConfig();
  if (!(ip in config.loginBannedIps)) {
    // By default, IP addresses are not banned
    return false;
  }
  // Check for explicit bans
  if (typeof config.loginBannedIps[ip] === 'boolean') {
    return config.loginBannedIps[ip];
  }

  // If fail2ban is disabled, skip this logic
  if (!config.enableFail2ban) {
    return false;
  }

  const failTimestamps = config.loginBannedIps[ip];
  // IP has failed to log in too many times
  if (failTimestamps.length >= FAILS_UNTIL_BAN) {
    // Ban is still active if last failed login is longer than BAN_DURATIOn ago
    if (failTimestamps.at(-1) ?? Number.POSITIVE_INFINITY < unixTime() - BAN_DURATION) {
      return true;
    }
    // Otherwise, reset the expired logins, since the ban has finished
    delete config.loginBannedIps[ip];
    await setLocalConfig(config);
  }
  // IP is not banned, hasn't failed enough times
  return false;
}

/** Notify fail2ban of a failed login */
export async function notifyFailedLogin(ip: string) {
  const config = await getLocalConfig();

  // Explicitly banned/allowed IPs require no action
  if (typeof config.loginBannedIps[ip] === 'boolean') {
    return;
  }

  // No action if fail2ban is disabled
  if (!config.enableFail2ban) {
    return;
  }

  // Filter expired login failures from the list
  const failTimestamps = filterExpiredLogs(config.loginBannedIps[ip] ?? []);
  // Then push the new failure time to the end
  failTimestamps.push(unixTime());

  config.loginBannedIps[ip] = failTimestamps;
  await setLocalConfig(config);
}

/** Remove ban/allow from IP */
export async function unbanIp(ip: string) {
  const config = await getLocalConfig();

  if (!(ip in config.loginBannedIps)) {
    error(400, 'This IP address has not been configured');
  }

  delete config.loginBannedIps[ip];

  await setLocalConfig(config);
}

/** Permanently ban an IP address */
export async function banIp(ip: string) {
  const config = await getLocalConfig();
  config.loginBannedIps[ip] = true;
  await setLocalConfig(config);
}

/** Allow all login attempts from an IP */
export async function allowIp(ip: string) {
  const config = await getLocalConfig();
  config.loginBannedIps[ip] = false;
  await setLocalConfig(config);
}

/** Get whether fail2ban is enabled */
export async function isFail2banEnabled() {
  const config = await getLocalConfig();
  return config.enableFail2ban;
}

/** Set whether fail2ban is enabled */
export async function setFail2Ban(newState: boolean) {
  const config = await getLocalConfig();
  config.enableFail2ban = newState;
  await setLocalConfig(config);
}
