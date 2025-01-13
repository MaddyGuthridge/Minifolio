/** Test suite for POST /api/admin/refresh */

import { beforeEach, expect, it } from 'vitest';
import { setup } from '../helpers';
import { getConfig, setConfig } from '$lib/server/data/config';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

// Since caching currently isn't implemented with the new system, this doesn't really
// test anything, but it should be useful if I do re-implement caching
it('Reloads data from the file system', async () => {
  // Manually modify the config data
  const config = await getConfig();
  config.siteIcon = 'icon.png';
  await setConfig(config);
  // After we refresh the data, the new site name is shown
  await expect(api.admin.data.refresh()).resolves.toStrictEqual({});
  await expect(api.config.get()).resolves.toMatchObject({ siteIcon: 'icon.png' });
});

genTokenTests(
  () => api,
  api => api.admin.data.refresh(),
);
