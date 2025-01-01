/** Configuration endpoints */
import { apiFetch, payload } from './fetch';
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
      '/data/config.json',
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
      '/data/config.json',
      { token, ...payload.json(config) },
    ).json() as Promise<Record<string, never>>;
  },
})
