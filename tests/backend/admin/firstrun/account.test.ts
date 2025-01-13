/**
 * Test cases for POST /api/admin/firstrun/account
 */
import api from '$endpoints';
import { it, describe, expect } from 'vitest';
// Yucky import
import type { FirstRunAuthOptions } from '../../../../src/routes/api/admin/firstrun/account/+server';
import { invalidIds, validIds } from '../../consts';

/** Helper function for firstrun testing */
async function firstrunAccount(options: Partial<FirstRunAuthOptions> = {}) {
  const defaults: FirstRunAuthOptions = {
    username: 'admin',
    password: 'abc123ABC!',
  };

  const combined = { ...defaults, ...options };

  return api().admin.firstrun.account(
    combined.username,
    combined.password,
  );
}

describe('username', () => {
  // Only ID characters are allowed as usernames
  it.each(invalidIds)('Rejects invalid usernames ($case)', async ({ id }) => {
    await expect(firstrunAccount({ username: id }))
      .rejects.toMatchObject({ code: 400 });
  });

  it.each(validIds)('Accepts valid usernames ($case)', async ({ id }) => {
    await expect(firstrunAccount({ username: id })).toResolve();
  });
});

describe('password', () => {
  it('Rejects insecure passwords', async () => {
    await expect(firstrunAccount({ password: 'insecure' }))
      .rejects.toMatchObject({ code: 400 });
  });
});

it('Gives a token on success', async () => {
  await expect(firstrunAccount())
    .resolves.toMatchObject({
      token: expect.any(String)
    });
});

it('Blocks access if account is already set up', async () => {
  await firstrunAccount();
  await expect(firstrunAccount()).rejects.toMatchObject({ code: 403 });
});
