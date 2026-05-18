/**
 * Test cases for /api/health
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import type { ApiClient } from '$endpoints';
import { beforeEach, expect, it } from 'vitest';
import { setup } from './helpers';
import { getDataDir, getPrivateDataDir } from '$lib/server/data/dataDir';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
});

it('is healthy after being set up', async () => {
  await expect(api.health()).resolves.toStrictEqual({
    healthy: true,
    configOk: true,
    dataOk: true,
    localConfigOk: true,
  });
});

it('is healthy after clearing data', async () => {
  await api.debug.clear();
  await expect(api.health()).resolves.toStrictEqual({
    healthy: true,
    configOk: null,
    dataOk: null,
    localConfigOk: null,
  });
});

it('is unhealthy after corrupting local config', async () => {
  const f = path.join(getPrivateDataDir(), 'config.local.json');
  await fs.writeFile(f, 'corrupt');
  await expect(api.health()).rejects.toMatchObject({
    code: 500,
    body: {
      healthy: false,
      configOk: true,
      dataOk: true,
      localConfigOk: false,
    },
  });
});

it('is unhealthy after corrupting config', async () => {
  const f = path.join(getDataDir(), 'config.json');
  await fs.writeFile(f, 'corrupt');
  await expect(api.health()).rejects.toMatchObject({
    code: 500,
    body: {
      healthy: false,
      configOk: false,
      dataOk: true,
      localConfigOk: true,
    },
  });
});

it('is unhealthy after corrupting data', async () => {
  const f = path.join(getDataDir(), 'info.json');
  await fs.writeFile(f, 'corrupt');
  await expect(api.health()).rejects.toMatchObject({
    code: 500,
    body: {
      healthy: false,
      configOk: true,
      dataOk: false,
      localConfigOk: true,
    },
  });
});
