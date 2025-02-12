/**
 * Test cases for POST /api/admin/auth/revoke
 */
import { it, expect } from 'vitest';
import { setup } from '../../helpers';
import api from '$endpoints';

const sleep = (ms: number) => new Promise<void>((r) => void setTimeout(r, ms));

it('Revokes the current token', async () => {
  const { api, username, password } = await setup();
  const { token: token2 } = await api.admin.auth.login(username, password);
  // Wait a second, since otherwise the token will have been created at the new
  // notBefore time
  await sleep(1000);
  await expect(api.admin.auth.revoke()).resolves.toStrictEqual({});
  // Both the current and a second token were revoked
  await expect(api.admin.auth.logout()).toReject();
  await expect(api.withToken(token2).admin.auth.logout()).toReject();
  // If we create a new token, it works correctly
  const { token: token3 } = await api.admin.auth.login(username, password);
  await expect(api.withToken(token3).admin.auth.logout()).toResolve();
});

it('Fails for invalid tokens', async () => {
  await expect(api(undefined).admin.auth.revoke()).toReject();
});

it('Gives a 400 when no data directory is set up', async () => {
  const { api } = await setup();
  await api.debug.clear();
  await expect(api.admin.auth.revoke()).rejects.toMatchObject({ code: 400 });
});
