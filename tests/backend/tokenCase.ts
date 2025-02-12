/** Test cases to ensure invalid tokens are rejected on all endpoints */

import api, { type ApiClient } from '$endpoints';
import { unixTime } from '$lib/util';
import { sign } from 'jsonwebtoken';
// No need for it to be secure for test cases
import { nanoid } from 'nanoid/non-secure';
import { describe, expect, test } from 'vitest';

/**
 * Generate test cases to ensure invalid tokens are rejected for the given
 * callback.
 *
 * It is expected that each test case will have sufficient setup. for the given
 * function to execute.
 */
export default function genTokenTests(
  getClient: () => ApiClient,
  fn: (api: ApiClient) => Promise<any>,
) {
  describe('Invalid token', () => {
    test('Token not provided', async () => {
      await expect(fn(api())).rejects.toMatchObject({ code: 401 });
    });

    test('Token has invalid structure', async () => {
      await expect(fn(getClient().withToken('invalid token'))).rejects.toMatchObject({ code: 401 });
    });

    test('Token has been invalidated', async () => {
      const client = getClient();
      // Log out
      await client.admin.auth.logout();
      // Operations with this token should now fail
      await expect(fn(client)).rejects.toMatchObject({ code: 401 });
    });

    test('Token has valid structure but incorrect signature', async () => {
      const token = sign({ sessionId: nanoid(), iat: unixTime() }, 'TEST INVALID SECRET');
      await expect(fn(getClient().withToken(token))).rejects.toMatchObject({ code: 401 });
    });
  });
}
