/**
 * Test cases for POST /api/admin/auth/revoke
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
  api => api.admin.auth.logout(),
);

const sleep = (ms: number) => new Promise<void>((r) => void setTimeout(r, ms));

it('Revokes all current tokens', async () => {
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

it('Gives a 400 when no data directory is set up', async () => {
  await api.debug.clear();
  await expect(api.admin.auth.revoke()).rejects.toMatchObject({ code: 400 });
});
