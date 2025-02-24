/** Test cases to ensure pages load correctly */

import { beforeEach, expect, test } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../backend/helpers';
import itemId from '$lib/itemId';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

test('Homepage loads', async () => {
  await expect(api.page.root()).resolves.toStrictEqual(expect.any(String));
});

test('About page loads with no token', async () => {
  await expect(api.withToken(undefined).page.about())
    .resolves.toStrictEqual(expect.any(String));
});

test('About page loads with token provided', async () => {
  await expect(api.page.about()).resolves.toStrictEqual(expect.any(String));
});

test('Item page loads', async () => {
  const id = itemId.fromStr('/my-item')
  await api.item(id).info.post('My item', 'My item');
  await expect(api.page.item(id)).resolves.toStrictEqual(expect.any(String));
});

test('Admin page loads with token', async () => {
  await expect(api.page.admin()).resolves.toStrictEqual(expect.any(String));
});
