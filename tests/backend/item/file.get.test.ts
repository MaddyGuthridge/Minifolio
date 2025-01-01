/**
 * Test cases for getting a file associated with an item.
 */

import { it, describe, beforeEach, expect } from 'vitest';
import type { ApiClient } from '$endpoints';
import { setup } from '../helpers';
import fromFileSystem from '../fileRequest';
import { readFile } from 'fs/promises';

let api: ApiClient;
beforeEach(async () => {
  api = (await setup()).api;
  await api.item([]).file('example.md').post(await fromFileSystem('README.md'));
});


describe('Success', () => {
  it('Returns the file', async () => {
    const content = await api.item([]).file('example.md').get().then(buf => buf.toString());
    expect(content).toStrictEqual(await readFile('README.md', { encoding: 'utf-8' }));
  });
});

describe('404', () => {
  it('Errors if the item does not exist', async () => {
    await expect(api.item(['invalid']).file('example.md').get())
      .rejects.toMatchObject({ code: 404 });
  });
  it('Errors if the file does not exist', async () => {
    await expect(api.item([]).file('invalid').get())
      .rejects.toMatchObject({ code: 404 });
  });
});
