/** Test cases for POST /api/admin/auth/logout */

import { beforeEach, expect, it } from 'vitest';
import { setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

genTokenTests(
  () => api,
  api => api.admin.auth.logout(),
);

it("Gives an error if the server isn't setup", async () => {
  await api.debug.clear();
  await expect(api.admin.auth.logout()).rejects.toMatchObject({ code: 400 });
});

it('Invalidates tokens', async () => {
  await expect(api.admin.auth.logout()).resolves.toStrictEqual({});
  // Now that we're logged out, logging out again should fail
  await expect(api.admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});
