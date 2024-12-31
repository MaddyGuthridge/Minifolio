/** Git repository endpoints */
import { apiFetch, payload } from '../fetch';

export default (token: string | undefined) => ({
  /** Set up the first account */
  account: async (username: string, password: string) => {
    return apiFetch(
      'POST',
      '/api/admin/firstrun/account',
      { token, ...payload.json({ username, password }) },
    ).json() as Promise<{ token: string }>;
  },
  /** Set up the site data */
  data: async (repoUrl: string | null = null, branch: string | null = null) => {
    return apiFetch(
      'POST',
      '/api/admin/firstrun/data',
      { token, ...payload.json({ repoUrl, branch }) },
    ).json() as Promise<{ firstTime: boolean }>;
  },
})
