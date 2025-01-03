import type { ProvidedRepoInfo, RepoProvider, RepoInfo } from '$lib/server/data/item/repo';

/** Info required to register a repo provider */
type RepoProviderInfo = {
  /** Name of provider (eg GitHub) */
  name: string
  /** Icon id to use (from LineAwesome) */
  icon: string
  /** Return a URL for the repo given the repo string */
  makeUrl: (repo: string) => string
  /**
   * Fetches the number of stars for the repo.
   *
   * Returns `undefined` if count could not be gathered.
   *
   * Function is undefined if fetching star counts is unavailable.
   */
  getStarCount: ((repo: string) => Promise<number | undefined>) | undefined
}

export const repoProviders: Record<RepoProvider, RepoProviderInfo> = {
  // GitHub
  github: {
    name: 'GitHub',
    icon: 'lab la-github',
    makeUrl: (repo: string): string => `https://github.com/${repo}`,
    getStarCount: async (repo: string): Promise<number | undefined> => {
      if (repo.split('/').length !== 2) {
        // Not a repo (perhaps an organisation) -- no star count
        return undefined;
      }
      // https://github.com/orgs/community/discussions/31111#discussioncomment-3492603
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      const json = await res.json();
      return json.stargazers_count as number;
    },
  },
  // GitLab
  gitlab: {
    name: 'GitLab',
    icon: 'lab la-gitlab',
    makeUrl: (repo: string): string => {
      return `https://gitlab.com/${repo}`;
    },
    // Accessing project statistics on GitLab requires an API token
    // https://docs.gitlab.com/ee/api/project_statistics.html
    getStarCount: undefined,
  }
};

/** Returns whether a repo uses a provider */
export function repoIsWithProvider(repo: RepoInfo): repo is ProvidedRepoInfo {
  return 'provider' in repo;
}
