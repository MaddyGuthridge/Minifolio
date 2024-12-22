
import { it, expect, test } from 'vitest';
import { makeGroup, setup } from '../helpers';
import api from '$endpoints';

test('No groups exist by default', async () => {
  const { api } = await setup();
  await expect(api.group.all()).resolves.toStrictEqual({});
});

it('Lists existing groups', async () => {
  const { api } = await setup();
  await makeGroup(api, 'my-group');
  await expect(api.group.all()).resolves.toStrictEqual({
    'my-group': expect.objectContaining({
      name: 'my-group',
      description: 'my-group',
    }),
  });
});

// it('Ignores the .git directory', { timeout: 15_000 }, async () => {
//   await setup(gitRepos.EMPTY);
//   await expect(api().group.all()).resolves.toStrictEqual({});
// });

it("Errors when the server hasn't been set up", async () => {
  await expect(api().group.all()).rejects.toMatchObject({ code: 400 });
});
