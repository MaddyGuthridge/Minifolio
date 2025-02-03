/** Test cases for get/setting the git config */

import { beforeEach, describe, expect, test } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../../helpers';
import genTokenTests from '../../tokenCase';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

test('By default, git config options are null', async () => {
  await expect(api.admin.git.config.get()).resolves.toStrictEqual({
    userName: null,
    userEmail: null,
  });
});

test('Can update git config', async () => {
  await expect(api.admin.git.config.post({ userName: 'Maddy', userEmail: 'maddy@email.com' }))
    .resolves.toStrictEqual({});
  // Config was updated
  await expect(api.admin.git.config.get()).resolves.toStrictEqual({
    userName: 'Maddy',
    userEmail: 'maddy@email.com',
  });
});

describe('Git config get', () => {
  genTokenTests(
    () => api,
    api => api.admin.git.config.get(),
  );
})

describe('Git config post', () => {
  genTokenTests(
    () => api,
    api => api.admin.git.config.post({ userName: null, userEmail: null }),
  );
})
