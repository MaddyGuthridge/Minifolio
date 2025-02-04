/** Git repository endpoints */
import type { GitConfig, RepoStatus } from '$lib/server/git';
import { apiFetch, payload } from '../fetch';

export default (fetchFn: typeof fetch, token: string | undefined) => ({
  /** Retrieve information about the data repository */
  status: async () => {
    return apiFetch(
      fetchFn,
      'GET',
      '/api/admin/git',
      { token },
    ).json() as Promise<{ repo: RepoStatus }>;
  },

  /** Interact with the configuration that Minifolio uses for Git */
  config: {
    /** Get configuration */
    get: async () => {
      return apiFetch(
        fetchFn,
        'GET',
        '/api/admin/git/config',
        { token },
      ).json() as Promise<GitConfig>;
    },
    /** Set configuration */
    post: async (config: GitConfig) => {
      return apiFetch(
        fetchFn,
        'POST',
        '/api/admin/git/config',
        { token, ...payload.json(config) },
      ).json() as Promise<Record<string, never>>;
    },
  },

  /** Initialize a git repo */
  init: async (url: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/git/init',
      { token, ...payload.json({ url }) },
    ).json() as Promise<RepoStatus>;
  },

  /** Perform a git commit */
  commit: async (message: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/git/commit',
      { token, ...payload.json({ message },) },
    ).json() as Promise<RepoStatus>;
  },

  /** Perform a git fetch */
  fetch: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/git/fetch',
      { token },
    ).json() as Promise<RepoStatus>;
  },

  /** Perform a git push */
  push: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/git/push',
      { token },
    ).json() as Promise<RepoStatus>;
  },

  /** Perform a git pull */
  pull: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/git/pull',
      { token },
    ).json() as Promise<RepoStatus>;
  },
});
