/** Configuration endpoints */
import { apiFetch, payload } from '../fetch';
import type { ConfigJson } from '$lib/server/data/config';

export default (token: string | undefined) => ({
  /**
   * Retrieve the site configuration.
   *
   * @param token The authentication token
   */
  get: async () => {
    return apiFetch(
      'GET',
      '/api/admin/config',
      { token },
    ).json() as Promise<ConfigJson>;
  },
  /**
   * Update the site configuration.
   *
   * @param token The authentication token
   * @param config The updated configuration
   */
  put: async (config: ConfigJson) => {
    return apiFetch(
      'PUT',
      '/api/admin/config',
      { token, ...payload.json(config) },
    ).json() as Promise<Record<string, never>>;
  },
})
