/** Test suite for POST /robots.txt */

import { beforeEach, expect, it } from 'vitest';
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

it('Creates the robots.txt file', async () => {
  await expect(api.robots.post(sampleFile))
    .resolves.toStrictEqual({});
});

it('Rejects if data is not set up', async () => {
  await api.debug.clear();
  await expect(api.robots.post(sampleFile))
    .rejects.toMatchObject({ code: 400 });
});

it('Rejects if file already exists', async () => {
  await api.robots.post(sampleFile);
  await expect(api.robots.post(sampleFile))
    .rejects.toMatchObject({ code: 400 });
});

genTokenTests(
  () => api,
  api => api.robots.post(sampleFile),
);
