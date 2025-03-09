import { repoProviders } from '$lib/repoInfo';
import type { RepoInfo } from '$lib/server/data/item/repo';
import { expect, test } from 'vitest';

test('Can fetch star count for GitHub projects', async () => {
  const repo: RepoInfo = {
    provider: 'github',
    path: 'MaddyGuthridge/Minifolio',
  };

  const provider = repoProviders[repo.provider];

  const getStarCount = provider.getStarCount!;

  await expect(getStarCount(repo.path)).toResolve();
});
