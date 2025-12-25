/** Test suite for DELETE /robots.txt */

import { beforeEach, describe, expect, it } from 'vitest';
import { setup } from '../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';
import dedent from 'dedent';

let api: ApiClient;

const sampleFile = dedent`
  User-agent: *
  Disallow: /
`;

beforeEach(async () => {
  api = (await setup()).api;
});

it('Rejects if the robots.txt file does not exist', async () => {
  await expect(api.robots.delete())
    .rejects.toMatchObject({ code: 404 });
});

it('Rejects if data is not set up', async () => {
  await api.debug.clear();
  await expect(api.robots.delete())
    .rejects.toMatchObject({ code: 400 });
});

it('Deletes robots.txt file', async () => {
  await api.robots.post(sampleFile);
  await expect(api.robots.delete())
    .resolves.toMatchObject({});
  // File was removed
  await expect(api.robots.get())
    .rejects.toMatchObject({ code: 404 });
});

describe('token tests', () => {
  beforeEach(async () => {
    await api.robots.post(sampleFile);
  });

  genTokenTests(
    () => api,
    api => api.robots.delete(),
  );
});
