/**
 * Test cases for getting the full data
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item(['child']).info.post('Child item');
});

describe('Success', () => {
  it('Shows full information for the given item', async () => {
    await expect(api.item(['child']).data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {},
    });
  });

  it('Recursively shows information about the child items', async () => {
    await expect(api.item([]).data()).resolves.toStrictEqual({
      info: expect.any(Object),
      readme: expect.any(String),
      children: {
        // Child object's info
        child: {
          info: expect.any(Object),
          readme: expect.any(String),
          children: {},
        }
      },
    });
  });
});

describe('404', () => {
  it("Rejects requests for items that don't exist", async () => {
    await expect(api.item(['invalid']).data())
      .rejects.toMatchObject({ code: 404 });
  });
});
