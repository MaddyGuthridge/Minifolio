import { beforeEach, expect, it } from 'vitest';
import { setup } from '../../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../../tokenCase';
import { getAuthSecret } from '$lib/server/auth/secret';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

genTokenTests(
  () => api,
  api => api.admin.auth.regenerateSecret(),
);

it("Gives an error if the server isn't set up", async () => {
  await api.debug.clear();
  await expect(api.admin.auth.regenerateSecret()).rejects.toMatchObject({ code: 400 });
});

it('Makes all tokens invalid', async () => {
  await expect(api.admin.auth.regenerateSecret()).resolves.toStrictEqual({});

  // Now other requests will fail
  await expect(api.admin.auth.regenerateSecret()).rejects.toMatchObject({ code: 401 });
});

it('Changes the auth secret', async () => {
  const oldSecret = await getAuthSecret();
  await expect(api.admin.auth.regenerateSecret()).resolves.toStrictEqual({});
  const newSecret = await getAuthSecret();
  expect(newSecret).not.toStrictEqual(oldSecret);
});
