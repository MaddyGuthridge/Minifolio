/** Test cases for POST /api/admin/auth/logout */

import { expect, it } from 'vitest';
import { setup } from '../../helpers';

it("Gives an error if the server isn't setup", async () => {
  const { api } = await setup();
  await api.debug.clear();
  await expect(api.admin.auth.logout()).rejects.toMatchObject({ code: 400 });
});

it('Gives an error for invalid tokens', async () => {
  const { api } = await setup();
  await expect(api.withToken('invalid token').admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});

it('Gives an error for empty tokens', async () => {
  const { api } = await setup();
  await expect(api.withToken('').admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});

it('Gives an error if no token is given tokens', async () => {
  const { api } = await setup();
  await expect(api.withToken(undefined).admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});

it('Invalidates tokens', async () => {
  const { api } = await setup();
  await expect(api.admin.auth.logout()).resolves.toStrictEqual({});
  // Now that we're logged out, logging out again should fail
  await expect(api.admin.auth.logout()).rejects.toMatchObject({ code: 401 });
});
