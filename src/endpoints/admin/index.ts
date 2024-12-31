/** Admin endpoints */
import auth from './auth';
import config from './config';
import git from './git';
import firstrun from './firstrun';
import { apiFetch } from '$endpoints/fetch';
import keys from './keys';

export async function refresh(token: string | undefined) {
  return await apiFetch('POST', '/api/admin/data/refresh', { token }).json() as Record<string, never>;
}

export default function admin(token: string | undefined) {
  return {
    /** Authentication options */
    auth: auth(token),
    /** Site configuration */
    config: config(token),
    /** Git actions */
    git: git(token),
    /** Key management (used for git operations) */
    keys: keys(token),
    /** Firstrun endpoints */
    firstrun: firstrun(token),
    /** Manage server data */
    data: {
      /** Refresh the data store */
      refresh: () => refresh(token),
    }
  };
}
