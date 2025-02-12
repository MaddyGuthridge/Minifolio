/**
 * Tests for POST /api/admin/auth/login
 *
 * Allows users to log into the site, enabling editing of the data.
 *
 * # Errors
 * - Invalid username
 * - Invalid password
 * - After repeated failed logins, all requests are rejected
 *
 * # Success
 * - Lets user log in if they give the correct credentials
 *
 * # Edge cases
 * - Empty form fields
 */
import { it, expect, beforeEach, describe, test } from 'vitest';
import { setup } from '../../helpers';
import api from '$endpoints';
import { getLocalConfig, setLocalConfig } from '$lib/server/data/localConfig';

let credentials: Awaited<ReturnType<typeof setup>>;

beforeEach(async () => {
  credentials = (await setup());
});

it("Gives an error when the server isn't setup", async () => {
  await api(undefined).debug.clear();
  await expect(api().admin.auth.login(credentials.username, credentials.password))
    .rejects.toMatchObject({ code: 400 });
});

it('Returns a token when correct credentials are provided', async () => {
  await expect(api().admin.auth.login(credentials.username, credentials.password))
    .resolves.toStrictEqual({ token: expect.any(String) });
});

test('Tokens are unique', async () => {
  const { token: token1 } = await api().admin.auth.login(credentials.username, credentials.password);
  const { token: token2 } = await api().admin.auth.login(credentials.username, credentials.password);
  expect(token1).not.toStrictEqual(token2);
});

it('Blocks logins with non-existent usernames', async () => {
  await expect(api().admin.auth.login('invalid user', credentials.password))
    .rejects.toMatchObject({ code: 401 });
});

it('Errors if fields are empty', async () => {
  await expect(api().admin.auth.login('', ''))
    .rejects.toMatchObject({ code: 401 });
});

it('Blocks logins with incorrect passwords', async () => {
  await expect(api().admin.auth.login(credentials.username, 'incorrect password'))
    .rejects.toMatchObject({ code: 401 });
});

/**
 * Run many failed login attempts, and ensure that there is a significant
 * difference between the times on average.
 */
it('Has random variance in the timing for failed passwords', async () => {
  let fastest = 100;
  let slowest = -1;
  // Run many logins, and check that there is more than 10ms difference between the
  // fastest and slowest
  async function tryLogin() {
    const start = Date.now();
    try {
      await api().admin.auth.login(credentials.username + 'hi', credentials.password);
      expect.unreachable('Login should have failed');
    } catch { /* empty */ }
    const time = Date.now() - start;
    if (time > slowest) {
      slowest = time;
    }
    if (time < fastest) {
      fastest = time;
    }
  }
  const promises: Promise<void>[] = []
  for (let i = 0; i < 10; i++) {
    promises.push(tryLogin());
  }
  await Promise.all(promises);

  // Now make sure that the difference is big enough
  expect(slowest - fastest).toBeGreaterThanOrEqual(10);
});

describe('fail2ban', () => {
  beforeEach(async () => {
    // Manually enable fail2ban, because the API isn't added yet
    const config = await getLocalConfig();
    config.enableFail2ban = true;
    await setLocalConfig(config);
    // Manually refresh data
    await api().debug.dataRefresh();
  });

  it('Blocks all logins after 25 failed login requests', async () => {
    async function tryLogin() {
      await api().admin.auth.login(credentials.username, 'incorrect')
        // Discard error
        .catch(() => { });
    }
    for (let i = 0; i < 25; i++) {
      // Back-end gets race conditions if we hit it with 25 requests at once
      // eslint-disable-next-line no-await-in-loop
      await tryLogin();
    }
    // User has been banned because of login failure happening too many times
    await expect(api().admin.auth.login(credentials.username, credentials.password))
      .rejects.toMatchObject({ code: 403 });
  });

  it.todo('IPs are un-banned after 24 hours');

  it.todo('Other IPs are not banned from logging in');
});
