/** Admin endpoints */
import auth from './auth';
import git from './git';
import firstrun from './firstrun';
import { apiFetch } from '$endpoints/fetch';
import keys from './keys';

export async function refresh(fetchFn: typeof fetch, token: string | undefined) {
  return await apiFetch(
    fetchFn,
    'POST',
    '/api/admin/data/refresh',
    { token },
  ).json() as Record<string, never>;
}

export default function admin(fetchFn: typeof fetch, token: string | undefined) {
  return {
    /** Authentication options */
    auth: auth(fetchFn, token),
    /** Git actions */
    git: git(fetchFn, token),
    /** Key management (used for git operations) */
    keys: keys(fetchFn, token),
    /** Firstrun endpoints */
    firstrun: firstrun(fetchFn, token),
    /** Manage server data */
    data: {
      /** Refresh the data store */
      refresh: () => refresh(fetchFn, token),
    },
  };
}
