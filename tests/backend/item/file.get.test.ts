/**
 * Test cases for getting a file associated with an item.
 */

import { it, describe, beforeEach } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item([]).file('example.md').put(await fromFileSystem('README.md'));
});


describe('Success', () => {
  it.todo('Returns the file');
});

describe('404', () => {
  it.todo('Errors if the item does not exist');
  it.todo('Errors if the file does not exist');
});
