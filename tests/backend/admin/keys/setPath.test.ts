/**
 * Test cases for setting the path to the SSH key-pair.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import api, { type ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { setup } from '../../helpers';
import genTokenTests from '../../tokenCase';
import { getPrivateDataDir } from '$lib/server/data/dataDir';

const DUMMY_PUBLIC_KEY = 'DUMMY PUBLIC KEY';
const DUMMY_PRIVATE_KEY = 'DUMMY PRIVATE KEY';

/**
 * Generate a dummy key pair to use
 */
async function generateDummyKeypair(): Promise<[string, string]> {
  const privateData = getPrivateDataDir();
  const privateKeyPath = path.join(privateData, 'keys', 'dummyKey');
  const publicKeyPath = privateKeyPath + '.pub';
  await fs.mkdir(path.join(privateData, 'keys'), { recursive: true });
  await fs.writeFile(privateKeyPath, DUMMY_PRIVATE_KEY);
  await fs.writeFile(publicKeyPath, DUMMY_PUBLIC_KEY);

  return [privateKeyPath, publicKeyPath];
}

it('Allows users to set an explicit path to an SSH key-pair', async () => {
  const { api } = await setup();
  const [privateKeyPath] = await generateDummyKeypair();
  await expect(api.admin.keys.setKeyPath(privateKeyPath))
    .resolves.toStrictEqual({
      keyPath: privateKeyPath,
      publicKey: DUMMY_PUBLIC_KEY,
    });
});

test('Endpoint gives a 400 before account is set up', async () => {
  const [privateKeyPath] = await generateDummyKeypair();
  await expect(api().admin.keys.setKeyPath(privateKeyPath))
    .rejects.toMatchObject({ code: 400 });
});

it('Key path can be set before data is set up', async () => {
  const { token } = await api().admin.firstrun.account('admin', 'abc123ABC$');
  const [privateKeyPath] = await generateDummyKeypair();
  await expect(api(fetch, token).admin.keys.setKeyPath(privateKeyPath)).toResolve();
});

it("Doesn't require a token when the server hasn't been set up", { fails: true }, async () => {
  const [privateKeyPath] = await generateDummyKeypair();
  await expect(api().admin.keys.setKeyPath(privateKeyPath))
    .toResolve();
});

it('Rejects SSH key-pair paths where the private key file does not exist', async () => {
  const { api } = await setup();
  const [privateKeyPath] = await generateDummyKeypair();
  await fs.unlink(privateKeyPath);
  await expect(api.admin.keys.setKeyPath(privateKeyPath))
    .rejects.toMatchObject({ code: 400 });
});

it('Rejects SSH key-pair paths where the public key file does not exist', async () => {
  const { api } = await setup();
  const [privateKeyPath, publicKeyPath] = await generateDummyKeypair();
  await fs.unlink(publicKeyPath);
  await expect(api.admin.keys.setKeyPath(privateKeyPath))
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
