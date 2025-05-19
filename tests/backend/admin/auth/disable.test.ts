/**
 * Test cases for POST /api/admin/auth/disable
 */
import { beforeEach, expect, it } from 'vitest';
import { setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../../tokenCase';

let api: ApiClient;
let username: string;
let password: string;

beforeEach(async () => {
  const res = await setup();
  api = res.api;
  username = res.username;
  password = res.password;
});

genTokenTests(
  () => api,
  api => api.admin.auth.disable(username, password),
);

it('Disables authentication', async () => {
  await expect(api.admin.auth.disable(username, password)).resolves.toStrictEqual({});
  // Logging in should fail
  await expect(api.admin.auth.login(username, password))
    // This is a 401 because we are partially migrated to a multi-user setup,
    // so this is equivalent to an incorrect username
    .rejects.toMatchObject({ code: 401 });
  // And any operation using the token should also fail
  // Technically, this should be a 403, since no value can ever be successful,
  // but I don't want to add another code path
  await expect(api.admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});

it('Errors for incorrect passwords', async () => {
  await expect(api.admin.auth.disable(username, 'incorrect'))
    .rejects.toMatchObject({ code: 403 });
});

it('Errors if the data is not set up', async () => {
  await api.debug.clear();
  await expect(api.admin.auth.disable(username, password))
    .rejects.toMatchObject({ code: 400 });
});
