/**
 * Test cases for PUT /api/admin/config
 *
 * Allows users to edit the site configuration
 */
import { beforeEach, expect, it } from 'vitest';
import { makeConfig, setup } from '../helpers';
import { version } from '$app/environment';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

it('Updates the current config contents', async () => {
  const newConfig = makeConfig();
  await expect(api.config.put(newConfig)).resolves.toStrictEqual({});
  // Config should have updated
  await expect(api.config.get()).resolves.toStrictEqual(newConfig);
});

it('Errors if the new config has an incorrect version', async () => {
  await expect(api.config.put(makeConfig({ version: version + 'invalid' })))
    .rejects.toMatchObject({ code: 400 });
});

it("Errors if the icon doesn't exist within the data dir", async () => {
  await expect(api.config.put(makeConfig({ siteIcon: 'not-a-file.jpg' })))
    .rejects.toMatchObject({ code: 400 });
});

genTokenTests(
  () => api,
  api => api.config.put(makeConfig()),
);

it('Errors if site is not set up', async () => {
  await api.debug.clear();
  await expect(api.config.put(makeConfig())).rejects.toMatchObject({ code: 400 });
});
