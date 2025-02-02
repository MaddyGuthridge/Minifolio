/**
 * Test cases for getting the full data
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item('/child').info.post('Child item');
});

describe('Success', () => {
  it('Shows full information for the given item', async () => {
    await expect(api.item('/child').data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {},
      ls: [],
    });
  });

  it('Recursively shows information about the child items', async () => {
    await expect(api.item('/').data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      ls: [],
      children: {
        // Child object's info
        child: {
          info: expect.any(Object),
          readme: expect.any(String),
          ls: [],
          children: {},
        }
      },
    });
  });

  it('Shows additional files in the directory', async () => {
    await api.item('/child').file('hello.txt').post(await fromFileSystem('README.md'));
    await expect(api.item('/child').data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {},
      ls: ['hello.txt'],
    });
  });
});

describe('404', () => {
  it("Rejects requests for items that don't exist", async () => {
    await expect(api.item('/invalid').data())
      .rejects.toMatchObject({ code: 404 });
  });
});
