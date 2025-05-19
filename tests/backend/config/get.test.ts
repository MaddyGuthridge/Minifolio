/**
 * Test cases for GET /api/admin/config
 *
 * Returns the current site configuration.
 */
import { type ApiClient } from '$endpoints';
import { beforeEach, expect, it } from 'vitest';
import { setup } from '../helpers';
import { version } from '$app/environment';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

it('Returns the current config contents', async () => {
  await expect(api.config.get()).resolves.toStrictEqual({
    siteIcon: null,
    verification: {
      relMe: [],
      atProtocol: null,
      google: null,
      bing: null,
    },
    version,
  });
});

it("Errors if the data isn't set up", async () => {
  await api.debug.clear();
  await expect(api.config.get())
    .rejects.toMatchObject({ code: 400 });
});
