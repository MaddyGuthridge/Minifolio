/** Test cases to ensure pages load correctly */

import { beforeEach, expect, test } from 'vitest';
import endpoints from './endpoints';
import type { ApiClient } from '$endpoints';
import { setup } from '../backend/helpers';
import itemId from '$lib/itemId';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

test('Homepage loads', async () => {
  await expect(endpoints.root()).resolves.toStrictEqual(expect.any(String));
});

test('About page loads', async () => {
  await expect(endpoints.about()).resolves.toStrictEqual(expect.any(String));
});

test('About page loads with token provided', async () => {
  await expect(endpoints.about(api.token)).resolves.toStrictEqual(expect.any(String));
});

test('Item page loads', async () => {
  const id = itemId.fromStr('/my-item')
  await api.item(id).info.post('My item', 'My item');
  await expect(endpoints.item(id)).resolves.toStrictEqual(expect.any(String));
});

test('Admin page loads with token', async () => {
  await expect(endpoints.admin(api.token)).resolves.toStrictEqual(expect.any(String));
});
