/**
 * Test cases for disabling key-based authentication for git operations.
 */
import { beforeEach, describe, expect, it, test } from 'vitest';
import { setup } from '../../helpers';
import genTokenTests from '../../tokenCase';
import api, { type ApiClient } from '$endpoints';


it('Allows key-based authentication to be disabled', async () => {
  const { api } = await setup();
  await expect(api.admin.keys.disable()).resolves.toStrictEqual({});
  // Side effect: querying auth info gives null
  await expect(api.admin.keys.get()).resolves.toStrictEqual({
    publicKey: null,
    keyPath: null,
  });
});

test('Endpoint gives a 400 before account is set up', async () => {
  await expect(api().admin.keys.disable())
    .rejects.toMatchObject({ code: 400 });
});

test('Endpoint can be used before data is set up', async () => {
  const { token } = await api().admin.firstrun.account('admin', 'abc123ABC$');
  await expect(api(fetch, token).admin.keys.disable()).toResolve();
});

describe('Token tests', () => {
  let api: ApiClient;
  beforeEach(async () => {
    api = (await setup()).api;
  });

  genTokenTests(
    () => api,
    api => api.admin.keys.get(),
  );
});
