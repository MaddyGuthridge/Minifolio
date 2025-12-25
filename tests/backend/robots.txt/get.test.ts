/** Test suite for GET /robots.txt */

import { beforeEach, expect, it } from 'vitest';
import { setup } from '../helpers';
import type { ApiClient } from '$endpoints';
import dedent from 'dedent';

let api: ApiClient;

const sampleFile = dedent`
  User-agent: *
  Disallow: /
`;

beforeEach(async () => {
  api = (await setup()).api;
});

it('Returns the robots.txt file', async () => {
  await api.robots.post(sampleFile);
  await expect(api.robots.get())
    .resolves.toStrictEqual(sampleFile);
});

it('Does not check token validity', async () => {
  await api.robots.post(sampleFile);
  await expect(api.withToken(undefined).robots.get())
    .resolves.toStrictEqual(sampleFile);
});

it('Gives a 404 if the file does not exist', async () => {
  await expect(api.robots.get())
    .rejects.toMatchObject({ code: 404 });
});

it('Rejects if data is not set up', async () => {
  await api.debug.clear();
  await expect(api.robots.get())
    .rejects.toMatchObject({ code: 400 });
});
