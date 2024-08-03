/**
 * Tests for POST /api/admin/auth/change
 *
 * Allows users to change the auth info, provided they are logged in.
 */
import { it, expect } from 'vitest';
import { setup } from '../../helpers';
import api from '$api';

it('Blocks unauthorized users', async () => {
  const { password } = await setup();
  await expect(api.admin.auth.change('', password, 'abc123ABC$'))
    .rejects.toMatchObject({ code: 401 });
});

it('Allows users to reset their password', async () => {
  const { token, username, password } = await setup();
  const newPassword = 'abc123ABC$';
  await expect(api.admin.auth.change(token, password, newPassword))
    .resolves.toStrictEqual({});
  // Logging in with new password should succeed
  await expect(api.admin.auth.login(username, newPassword)).toResolve();
  // Logging in with old password should fail
  await expect(api.admin.auth.login(username, password)).toReject();
});

it('Rejects incorrect previous passwords', async () => {
  const { token } = await setup();
  await expect(api.admin.auth.change(token, 'incorrect', 'abc123ABC$'))
    .rejects.toMatchObject({ code: 403 });
});

it('Rejects insecure new passwords', async () => {
  const { token, password } = await setup();
  await expect(api.admin.auth.change(token, password, 'insecure'))
    .rejects.toMatchObject({ code: 400 });
});

it('Errors if the data is not set up', async () => {
  const { token, password } = await setup();
  await api.debug.clear();
  await expect(api.admin.auth.change(token, password, 'abc123ABC$'))
    .rejects.toMatchObject({ code: 400 });
});
