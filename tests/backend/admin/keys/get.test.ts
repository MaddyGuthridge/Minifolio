/**
 * Test cases for public key requests
 */

import api, { type ApiClient } from '$endpoints';
import { beforeEach, describe, expect, test } from 'vitest';
import { setup } from '../../helpers';
import genTokenTests from '../../tokenCase';

test('Public key is `null` before it is generated', async () => {
  const { api } = await setup();
  await expect(api.admin.keys.get())
    .resolves.toStrictEqual({ publicKey: null, keyPath: null });
});

test('Public key has value after it is generated', async () => {
  const { api } = await setup();
  await api.admin.keys.generate();
  await expect(api.admin.keys.get())
    .resolves.toStrictEqual({ publicKey: expect.any(String), keyPath: expect.any(String) });
});

test('Public key can be requested before data is set up', async () => {
  const { token } = await api().admin.firstrun.account('admin', 'abc123ABC$');
  await expect(api(fetch, token).admin.keys.get()).toResolve();
});

test('Endpoint gives a 400 before account is set up', async () => {
  await expect(api().admin.keys.get())
    .rejects.toMatchObject({ code: 400 });
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
