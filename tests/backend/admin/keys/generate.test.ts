/**
 * Test cases for generating a public key.
 */
import api, { type ApiClient } from '$endpoints';
import { beforeEach, describe, expect, test } from 'vitest';
import { setup } from '../../helpers';
import genTokenTests from '../../tokenCase';
import { getPrivateDataDir } from '$lib/server/data/dataDir';

test('Key is generated when requested', async () => {
  const { api } = await setup();
  await expect(api.admin.keys.generate()).resolves
    .toStrictEqual({ publicKey: expect.any(String), keyPath: expect.any(String) });
});

test('Key can be generated before data is set up', async () => {
  const { token } = await api().admin.firstrun.account('admin', 'abc123ABC$');
  await expect(api(fetch, token).admin.keys.generate()).toResolve();
});

test('Endpoint gives a 400 before account is set up', async () => {
  await expect(api().admin.keys.generate())
    .rejects.toMatchObject({ code: 400 });
});

test('Generated keys are stored within the private data directory', async () => {
  const { api } = await setup();
  const keyPath = await api.admin.keys.generate().then(res => res.keyPath);
  // Path to key file should be entirely contained within private data dir
  expect(
    keyPath.startsWith(
      // Intentionally remove leading `./` as it is not included
      // This would be better with path checking, but I honestly cannot be
      // bothered at the moment.
      getPrivateDataDir().replace('./', ''),
    ),
  ).toBeTrue();
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
