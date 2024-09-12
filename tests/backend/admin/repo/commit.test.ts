/**
 * Test cases for POST /api/admin/repo/commit
 */
import { it, expect, beforeEach } from 'vitest';
import { setup } from '../../helpers';
import makeClient, { type ApiClient } from '$endpoints';
import gitRepos from '../../gitRepos';
import simpleGit from 'simple-git';
import { getDataDir } from '$lib/server/data/dataDir';
import genTokenTests from '../../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

it.todo('Creates a commit with the current changes');

it.todo('Returns that status is one commit ahead of origin');

it.todo("Gives a 400 error when data dir isn't using git");

it.todo('Gives a 400 when no data dir set up');

it.todo('Gives a 400 when there are no current changes');

genTokenTests(
  () => api,
  async api => {},
);
