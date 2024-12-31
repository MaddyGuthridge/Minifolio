/**
 * Test cases for updating item info
 */

import type { ApiClient } from '$endpoints';
import { beforeEach, describe, it } from 'vitest';
import { makeItemInfo, setup } from '../helpers';
import genTokenTests from '../tokenCase';

describe('Success', () => {
  it.todo('Successfully updates item info');
});

describe('400', () => {
  it.todo('Rejects invalid item names');

  it.todo('Rejects invalid item short names');

  it.todo('Rejects non-existent item icons');

  it.todo('Rejects non-existent item banners');

  it.todo('Rejects non-image item icons');

  it.todo('Rejects non-image item banners');

  it.todo('Rejects invalid item colors');

  describe('Section data', () => {
    it.todo('Rejects unrecognized item sections');

    it.todo('Rejects sections with invalid titles');

    it.todo('Rejects link sections with links to invalid items');
  });

  it.todo('Rejects if listed child does not exist');

  it.todo('Rejects if filter item does not exist');

  it.todo('Rejects empty string SEO description');
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
    api => api.item(itemId).info.put(makeItemInfo()),
  );
});

describe('404', () => {
  it.todo('Rejects if item does not exist');
})
