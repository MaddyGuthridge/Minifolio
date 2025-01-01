/**
 * Test cases for uploading files to an item.
 */

import { it, describe, beforeEach } from 'vitest';
import genTokenTests from '../tokenCase';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item([]).file('example.md').put(await fromFileSystem('README.md'));
});


describe('Success', () => {
  it.todo('Updates the file');
});

describe('401', () => {
  genTokenTests(
    () => api,
    async api => api.item([]).file('example.md').put(await fromFileSystem('README.md')),
  );
});

describe('404', () => {
  it.todo('Errors if the item does not exist');
  it.todo('Errors if the file does not exist');
});
