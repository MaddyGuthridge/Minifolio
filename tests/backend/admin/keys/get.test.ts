/**
 * Test cases for public key requests
 */

import api, { type ApiClient } from "$endpoints";
import { beforeEach, describe, expect, test } from "vitest";
import { setup } from "../../helpers";
import genTokenTests from "../../tokenCase";


test('Public key can be requested without token when server is not set up', async () => {
  await expect(api().admin.keys.get())
    .resolves.toStrictEqual({ publicKey: expect.any(String) });
});

test('Public key can be requested with token when server is set up', async () => {
  const { api } = await setup();
  await expect(api.admin.keys.get())
    .resolves.toStrictEqual({ publicKey: expect.any(String) });
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
