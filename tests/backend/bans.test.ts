import { getUrl } from '#lib/endpoints/fetch/index.ts';
import { expect, test } from 'vitest';
import { setup } from './helpers';

test("Clients that don't specify a user-agent are blocked", async () => {
  await setup();
  const url = getUrl();
  // Intentionally remove User-Agent
  const headers = new Headers({ 'User-Agent': '' });
  await expect(fetch(url, { headers })).resolves.toMatchObject({ status: 403 });
});
