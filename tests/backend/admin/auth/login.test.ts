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
import { it, expect, beforeEach } from 'vitest';
import { setup } from '../../helpers';
import api from '$endpoints';
import type { FirstRunCredentials } from '$lib/server/auth';

let credentials: FirstRunCredentials;

beforeEach(async () => {
  credentials = (await setup()).credentials;
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

// This test fails, because I haven't implemented the feature yet
it('Blocks all logins after 25 failed login requests', { fails: true }, async () => {
  for (let i = 0; i < 25; i++) {
    await api().admin.auth.login(credentials.username + 'hi', credentials.password)
      // Discard error
      .catch(() => {});
  }
  // User has been banned because of login failure happening too many times
  await expect(api().admin.auth.login(credentials.username, credentials.password))
    .rejects.toMatchObject({ code: 403 });
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
  // FIXME: Reduce this number so that the number of unsuccessful logins before a
  // ban is reduced
  // and perhaps find a way to get vitest to retry it a number of times if it
  // fails
  for (let i = 0; i < 25; i++) {
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

  // Now make sure that the difference is big enough
  expect(slowest - fastest).toBeGreaterThanOrEqual(10);
});
