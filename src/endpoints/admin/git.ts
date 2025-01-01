/** Git repository endpoints */
import type { RepoStatus } from '$lib/server/git';
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
