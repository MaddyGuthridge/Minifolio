import { beforeEach, describe, expect, it, test } from 'vitest';
import { makeConfig, setup } from '../helpers';
import type { ApiClient } from '$endpoints';

let api: ApiClient;

beforeEach(async () => {
  api = (await setup()).api;
});

describe('rel="me"', () => {
  it('Allows for rel="me" site verification', async () => {
    const url = 'https://social.example.com/@someone';
    await api.config.put(makeConfig({ verification: {
      relMe: [url],
      atProtocol: null,
      google: null,
      bing: null,
    }}));

    // rel="me" now included in metadata
    const rootPage = await api.page.root();
    expect(rootPage.includes(`<link rel="me" href="${url}"`)).toBeTrue();
  });

  it('Rejects invalid URLs for rel="me" site verification', async () => {
    const url = 'social.example.com/@someone';
    await expect(api.config.put(makeConfig({ verification: {
      relMe: [url],
      atProtocol: null,
      google: null,
      bing: null,
    }}))).rejects.toMatchObject({ code: 400 });
  });
});

describe('AT Protocol', () => {
  it('Allows for AT protocol site verification', async () => {
    const did = 'did:plc:abcdef...';
    await api.config.put(makeConfig({ verification: {
      relMe: [],
      atProtocol: did,
      google: null,
      bing: null,
    }}));

    // AT protocol page now shows that content
    await expect(api.page.atProtoDid()).resolves.toStrictEqual(did);
  });

  it("Rejects DIDs that don't start with 'did:'", async () => {
    await expect(api.config.put(makeConfig({ verification: {
      relMe: [],
      atProtocol: 'invalid:did:abcdef...',
      google: null,
      bing: null,
    }}))).rejects.toMatchObject({ code: 400 });
  });

  test('AT protocol page gives a 404 if no verification is set up', async () => {
    // No verification set up by default
    await expect(api.page.atProtoDid())
      .rejects.toMatchObject({ code: 404 });
  });
})
