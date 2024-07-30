/**
 * Test cases for POST /api/admin/repo
 */
import api from '$api';
import simpleGit, { CheckRepoActions } from 'simple-git';


beforeEach(api.debug.clear);

const REPO_PATH = process.env.DATA_REPO_PATH;

const repo = () => simpleGit(REPO_PATH);

it('Clones repo to the default branch when URL is provided', async () => {
  await api.admin.repo.post('git@github.com:MadGutsBot/Example.git', null);
  await expect(repo().checkIsRepo(CheckRepoActions.IS_REPO_ROOT)).resolves.toBeTrue();
});

it('Blocks access if data is already set up', async () => {
  await api.admin.repo.post('git@github.com:MadGutsBot/Example.git', null);
  await expect(
    api.admin.repo.post('git@github.com:MadGutsBot/Example.git', null)
  ).rejects.toMatchObject({ code: 403 });
});

it("Gives an error if the repo doesn't contain a config.json, but isn't empty", async () => {
  await expect(
    api.admin.repo.post('git@github.com:MadGutsBot/MadGutsBot.github.io', null)
  ).rejects.toMatchObject({ code: 400 });
});

it("Doesn't give an error if the repository is entirely empty", async () => {
  await api.admin.repo.post('git@github.com:MadGutsBot/Empty.git', null);
  await expect(repo().checkIsRepo(CheckRepoActions.IS_REPO_ROOT)).resolves.toBeTrue();
});

it("Doesn't clone repo when no URL provided", async () => {
  await api.admin.repo.post(null, null);
  await expect(repo().checkIsRepo()).resolves.toBeFalse();
});

it('Checks out a branch when one is given', async () => {
  await api.admin.repo.post('git@github.com:MadGutsBot/Example.git', 'example');
  // Check branch name matches
  expect((await repo().status()).current).toStrictEqual('example');
});

it('Gives an error if the repo URL cannot be cloned', async () => {
  await expect(
    api.admin.repo.post('git@github.com:MadGutsBot/Invalid-Repo', null)
  ).rejects.toMatchObject({ code: 400 });
});
