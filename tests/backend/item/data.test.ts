/**
 * Test cases for getting the full data
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import itemId from '$lib/itemId';
import { payload } from '$endpoints/fetch';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item(itemId.fromStr('/child')).info.post('Child item');
});

describe('Success', () => {
  it('Shows full information for the given item', async () => {
    await expect(api.item(itemId.fromStr('/child')).data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {},
      ls: ['README.md'],
    });
  });

  it('Recursively shows information about the child items', async () => {
    await expect(api.item(itemId.ROOT).data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      ls: ['README.md'],
      children: {
        // Child object's info
        child: {
          info: expect.any(Object),
          readme: expect.any(String),
          ls: ['README.md'],
          children: {},
        }
      },
    });
  });

  it('Shows additional files in the directory', async () => {
    await api
      .item(itemId.fromStr('/child'))
      .file('hello.txt')
      .post(payload.file(await fromFileSystem('README.md')));

    await expect(api.item(itemId.fromStr('/child')).data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {},
      ls: ['README.md', 'hello.txt'],
    });
  });
});

describe('404', () => {
  it("Rejects requests for items that don't exist", async () => {
    await expect(api.item(itemId.fromStr('/invalid')).data())
      .rejects.toMatchObject({ code: 404 });
  });
});
