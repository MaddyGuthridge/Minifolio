/**
 * Test cases for deleting items.
 */
import type { ApiClient } from '$endpoints';
import { beforeEach, describe, it } from 'vitest';
import { setup } from '../helpers';
import genTokenTests from '../tokenCase';

describe('Success', () => {
  it.todo('Successfully deletes items');

  it.todo('Removes child items');

  it.todo('Removes links to this item');

  it.todo('Removes links to child items');

  it.todo('Removes this item from the children of its parent');
});

describe('401', () => {
  let api: ApiClient;
  const itemId = ['item'];
  beforeEach(async () => {
    api = (await setup()).api;
    await api.item(itemId).info.post('My item');
  });

  genTokenTests(
    () => api,
    api => api.item(itemId).info.delete(),
  );
});

describe('403', () => {
  it.todo('Blocks deletion of the root item');
});

describe('404', () => {
  it.todo("Rejects if item doesn't exist");
});
