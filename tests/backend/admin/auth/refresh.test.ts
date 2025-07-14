/** Test cases for POST /api/admin/auth/refresh */

import { beforeEach, expect, it, test } from 'vitest';
import { setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

genTokenTests(
  () => api,
  api => api.admin.auth.refresh(),
);

it("Gives an error if the server isn't setup", async () => {
  await api.debug.clear();
  await expect(api.admin.auth.refresh()).rejects.toMatchObject({ code: 400 });
});

it('Invalidates tokens', async () => {
  await expect(api.admin.auth.refresh()).resolves.toStrictEqual({ token: expect.any(String) });
  // Refreshing invalidated the old token
  await expect(api.admin.auth.refresh()).rejects.toMatchObject({ code: 401 });
});

test('New token works correctly', async () => {
  const { token } = await api.admin.auth.refresh();
  await expect(api.withToken(token).admin.auth.refresh()).toResolve();
});
