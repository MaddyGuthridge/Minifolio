/** Test suite for PUT /robots.txt */

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
  await expect(api.robots.put(sampleFile))
    .rejects.toMatchObject({ code: 404 });
});

it('Rejects if data is not set up', async () => {
  await api.debug.clear();
  await expect(api.robots.post(sampleFile))
    .rejects.toMatchObject({ code: 400 });
});

it('Replaces robots.txt file', async () => {
  await api.robots.post(dedent`
    # Example file
  `);
  await expect(api.robots.put(sampleFile))
    .resolves.toMatchObject({});
  // File contents were updated
  await expect(api.robots.get())
    .resolves.toStrictEqual(sampleFile);
});

describe('token tests', () => {
  beforeEach(async () => {
    await api.robots.post(sampleFile);
  });

  genTokenTests(
    () => api,
    api => api.robots.put(sampleFile),
  );
});
