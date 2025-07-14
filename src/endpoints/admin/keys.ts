import { apiFetch, payload } from '$endpoints/fetch';

export default (fetchFn: typeof fetch, token: string | undefined) => ({
  /**
   * Returns the server's SSH public key, and the path to the private key
   * file
   */
  get: async () => {
    return apiFetch(
      fetchFn,
      'GET',
      '/api/admin/keys',
      { token },
    ).json() as Promise<{ publicKey: string, keyPath: string }>;
  },
  /** Sets the path to the file the server should use as the private key */
  setKeyPath: async (keyPath: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/keys',
      { token, ...payload.json({ keyPath }) },

    ).json() as Promise<{ publicKey: string, keyPath: string }>;
  },
  /** Disables SSH key-based authentication */
  disable: async () => {
    return apiFetch(
      fetchFn,
      'DELETE',
      '/api/admin/keys',
      { token },
    ).json() as Promise<Record<string, never>>;
  },
  /** Generate an SSH key-pair */
  generate: async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/admin/keys/generate',
      { token },
    ).json() as Promise<{ publicKey: string, keyPath: string }>;
  },
});
