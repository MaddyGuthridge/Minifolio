/**
 * Test cases for POST /api/admin/firstrun/data
 */
import api, { type ApiClient } from '$endpoints';
import { it, describe, expect, vi, beforeEach } from 'vitest';
import simpleGit, { CheckRepoActions } from 'simple-git';
// Yucky import
import type { FirstRunDataOptions } from '../../../../src/routes/api/admin/firstrun/data/+server';
import { getDataDir } from '$lib/server/data/dataDir';
import genTokenTests from '../../tokenCase';

// Git clone takes a while, increase the test timeout
vi.setConfig({ testTimeout: 15_000 });

const REPO_PATH = getDataDir();

/** Make a simpleGit for the repo */
const repo = () => simpleGit(REPO_PATH);

async function accountSetup() {
  const { token } = await api().admin.firstrun.account('admin', 'abc123ABC$');
  return token;
}

/** Helper function for firstrun testing */
async function firstrunData(token: string, options: Partial<FirstRunDataOptions> = {}) {
  const defaults: FirstRunDataOptions = {
    repoUrl: undefined,
    branch: undefined,
  };

  const combined = { ...defaults, ...options };


  return api(fetch, token).admin.firstrun.data(
    combined.repoUrl,
    combined.branch,
  );
}

it('Blocks access if data is already set up', async () => {
  const token = await accountSetup();
  await firstrunData(token);
  await expect(firstrunData(token)).rejects.toMatchObject({ code: 403 });
});

it("Doesn't clone repo when no URL provided", async () => {
  const token = await accountSetup();
  await firstrunData(token);
  await expect(repo().checkIsRepo(CheckRepoActions.IS_REPO_ROOT))
    .resolves.toStrictEqual(false);
});

it('Generates root item by default', async () => {
  const token = await accountSetup();
  await firstrunData(token);
  const client = api(fetch, token);
  await expect(client.item([]).info.get()).toResolve();
});

describe('token cases', () => {
  let client: ApiClient;

  beforeEach(async () => {
    const token = await accountSetup();
    client = api(fetch, token);
  });

  genTokenTests(
    () => client,
    api => api.admin.firstrun.data(),
  );
});
