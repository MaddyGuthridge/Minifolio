import { fediverseHandleToUrl, getStarCountGitHub } from '$lib/social';
import { describe, expect, test } from 'vitest';

describe('github star count', () => {
  test('Can fetch star count for GitHub projects', async () => {
    await expect(getStarCountGitHub('MaddyGuthridge/Minifolio'))
      .resolves.toStrictEqual(expect.any(Number));
  });

  test('No star count for orgs or accounts', async () => {
    await expect(getStarCountGitHub('MaddyGuthridge'))
      .resolves.toStrictEqual(undefined);
  });
});

describe('fedi URL', () => {
  test('correctly gets URL for fediverse accounts', () => {
    expect(fediverseHandleToUrl('@maddy@tech.lgbt')).toStrictEqual('https://tech.lgbt/@maddy');
  });
  test.each([
    '@maddy',
    'maddy@tech.lgbt',
    'maddy',
  ])('gives undefined for malformed accounts', (account) => {
    expect(fediverseHandleToUrl(account)).toStrictEqual(undefined);
  });
});
