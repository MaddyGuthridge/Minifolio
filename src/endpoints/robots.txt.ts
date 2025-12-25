/** Configuration endpoints */
import { apiFetch, payload } from './fetch';

export default (fetchFn: typeof fetch, token: string | undefined) => ({
  /**
   * Retrieve the site's robots.txt
   *
   * @param token The authentication token
   */
  get: async () => {
    return apiFetch(
      fetchFn,
      'GET',
      '/robots.txt',
      { token },
    ).text();
  },
  /**
   * Create a robots.txt file for the site
   *
   * @param token The authentication token
   * @param text Content for robots.txt
   */
  post: async (text: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/robots.txt',
      { token, ...payload.text(text) },
    ).json() as Promise<Record<string, never>>;
  },
  /**
   * Update the site's robots.txt
   *
   * @param token The authentication token
   * @param text New content for robots.txt
   */
  put: async (text: string) => {
    return apiFetch(
      fetchFn,
      'PUT',
      '/robots.txt',
      { token, ...payload.text(text) },
    ).json() as Promise<Record<string, never>>;
  },
  /**
   * Create a robots.txt file for the site
   *
   * @param token The authentication token
   * @param text Content for robots.txt
   */
  delete: async () => {
    return apiFetch(
      fetchFn,
      'DELETE',
      '/robots.txt',
      { token },
    ).json() as Promise<Record<string, never>>;
  },
});
