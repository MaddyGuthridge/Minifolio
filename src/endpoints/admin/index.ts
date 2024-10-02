/** Admin endpoints */
import auth from './auth';
import config from './config';
import git from './git';
import firstrun from './firstrun';
import { apiFetch, json } from '$endpoints/fetch';
import keys from './keys';

export async function refresh(token: string | undefined) {
  return await json(apiFetch('POST', '/api/admin/data/refresh', token)) as Record<string, never>;
}

export default function admin(token: string | undefined) {
  return {
    auth: auth(token),
    config: config(token),
    git: git(token),
    keys: keys(token),
    firstrun,
    data: {
      /** Refresh the data store */
      refresh: () => refresh(token),
    }
  };
}
