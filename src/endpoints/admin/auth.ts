/** Authentication endpoints */
import { apiFetch, payload } from '../fetch';

export default (fetchFn: typeof fetch, token: string | undefined) => ({
  /**
   * Log in as an administrator for the site
   *
   * @param username The username of the admin account
   * @param password The password of the admin account
   */
  login: async (username: string, password: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/login',
      payload.json({ username, password }),
    ).json() as Promise<{ token: string }>;
  },
  /**
   * Log out, invalidating the token
   *
   * @param token The token to invalidate
   */
  logout: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/logout',
      { token },
    ).json();
  },
  /**
   * Refresh the given token, invalidating it and returning a new one.
   */
  refresh: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/refresh',
      { token },
    ).json() as Promise<{ token: string }>;
  },
  /**
   * Change the authentication of the admin account
   *
   * @param token The auth token
   * @param oldPassword The currently-active password
   * @param newPassword The new replacement password
   */
  change: async (newUsername: string, oldPassword: string, newPassword: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/change',
      { token, ...payload.json({ newUsername, oldPassword, newPassword }) },
    ).json() as Promise<Record<string, never>>;
  },
  /**
   * Revoke all current API tokens
   *
   * @param token The auth token
   */
  revoke: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/revoke',
      { token }
    ).json() as Promise<Record<string, never>>;
  },
  /**
   * Disable authentication, meaning that users can no-longer log into the
   * system.
   *
   * @param token The auth token
   * @param password The password to the admin account
   */
  disable: async (username: string, password: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/disable',
      { token, ...payload.json({ username, password }) },
    ).json() as Promise<Record<string, never>>;
  },
  /**
   * Regenerate authentication secret, thereby invalidating all sessions for all users.
   */
  regenerateSecret: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/auth/regenerate-secret',
      { token },
    ).json() as Promise<Record<string, never>>;
  },
});
