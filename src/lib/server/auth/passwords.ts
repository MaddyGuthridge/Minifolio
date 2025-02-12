
import { hash } from 'crypto';
import { getLocalConfig } from '../data/localConfig';
import { error } from '@sveltejs/kit';

/**
 * How long to wait (in ms) before notifying the user that their login attempt
 * was rejected.
 */
const FAIL_DURATION = 100;

/**
 * Promise that resolves in a random amount of time, used to get some timing
 * invariance.
 */
const sleepRandom = () => new Promise<void>((r) => void setTimeout(r, Math.random() * FAIL_DURATION));

/**
 * Throw a 401 after a random (small) amount of time, so that timing attacks
 * cannot be used reliably.
 */
async function fail(timer: Promise<void>, code: number) {
  await timer;
  return error(code, 'The username or password is incorrect');
}

/** Hash a password with the given salt, returning the result */
export function hashAndSalt(salt: string, password: string): string {
  // TODO: Thoroughly check this against the OWASP guidelines -- it might
  // not match the requirements.
  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  return hash('SHA256', salt + password);
}

/**
 * Validate the user's credentials.
 *
 * If validation is successful, the user's userId is returned.
 *
 * If the credentials fail to validate, a random amount of time is waited
 * before sending the response, in order to prevent timing attacks.
 */
export async function validateCredentials(
  username: string,
  password: string,
  code = 401,
): Promise<string> {
  const local = await getLocalConfig();

  const failTimer = sleepRandom();

  // Find a user with a matching username
  const userId = Object.keys(local.auth).find(id => local.auth[id].username === username);

  if (!userId) {
    return fail(failTimer, code);
  }

  const hashResult = hashAndSalt(local.auth[userId].password.salt, password);

  if (hashResult !== local.auth[userId].password.hash) {
    return fail(failTimer, code);
  }
  return userId;
}
