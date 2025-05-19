/**
 * Tests for POST /api/admin/auth/change
 *
 * Allows users to change the auth info, provided they are logged in.
 */
import { beforeEach, expect, it } from 'vitest';
import { setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../../tokenCase';

let api: ApiClient;
let password: string;

beforeEach(async () => {
  const res = await setup();
  api = res.api;
  password = res.password;
});

genTokenTests(
  () => api,
  api => api.admin.auth.change('foo', password, 'abc123ABC$'),
);

it('Blocks unauthorized users', async () => {
  await expect(api.withToken(undefined).admin.auth.change('foo', password, 'abc123ABC$'))
    .rejects.toMatchObject({ code: 401 });
});

it('Allows users to reset their password', async () => {
  const newPassword = 'abc123ABC$';
  await expect(api.admin.auth.change('foo', password, newPassword))
    .resolves.toStrictEqual({});
  // Logging in with new password should succeed
  await expect(api.admin.auth.login('foo', newPassword)).toResolve();
  // Logging in with old password should fail
  await expect(api.admin.auth.login('foo', password)).toReject();
});

it('Rejects incorrect previous passwords', async () => {
  await expect(api.admin.auth.change('foo', 'incorrect', 'abc123ABC$'))
    .rejects.toMatchObject({ code: 403 });
});

it('Rejects insecure new passwords', async () => {
  await expect(api.admin.auth.change('foo', password, 'insecure'))
    .rejects.toMatchObject({ code: 400 });
});

it('Rejects empty new usernames', async () => {
  await expect(api.admin.auth.change('', password, 'abc123ABC$'))
    .rejects.toMatchObject({ code: 400 });
});

it('Errors if the data is not set up', async () => {
  await api.debug.clear();
  await expect(api.admin.auth.change('foo', password, 'abc123ABC$'))
    .rejects.toMatchObject({ code: 400 });
});
