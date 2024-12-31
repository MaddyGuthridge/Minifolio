/**
 * Test cases for creating new items
 */
import { beforeEach, describe, it } from 'vitest';
import { setup } from '../helpers';
import type { ApiClient } from '$endpoints';
import genTokenTests from '../tokenCase';

describe('Success', () => {
  it.todo('Allows valid IDs');

  it.todo('Allows valid item names');

  it.todo('Generates item with a valid `info.json`');

  it.todo('Generates item with a valid `README.md`');

  it.todo('Adds new items as children by default');
});

describe('400', () => {
  it.todo('Fails if the data is not set up');

  it.todo('Rejects invalid item IDs');

  it.todo('Rejects duplicate IDs');

  it.todo('Rejects invalid item names');

  it.todo("Rejects new items when the parent doesn't exist");
});

describe('401', () => {
  let api: ApiClient;
  beforeEach(async () => {
    api = (await setup()).api;
  });

  genTokenTests(
    () => api,
    api => api.item(['my-item']).info.post('My item', ''),
  );
});
