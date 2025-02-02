/** Debug endpoints */
import { apiFetch, payload } from './fetch';

export default function debug(fetchFn: typeof fetch, token: string | undefined) {
  const clear = async () => {
    return apiFetch(
      fetchFn,
      'DELETE',
      '/api/debug/clear',
      { token },
    ).json() as Promise<Record<string, never>>;
  };

  const echo = async (text: string) => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/debug/echo',
      { token, ...payload.json({ text }) },
    ).json() as Promise<Record<string, never>>;
  };

  const dataRefresh = async () => {
    return apiFetch(
      fetchFn,
      'POST',
      '/api/debug/data/refresh',
      { token },
    ).json() as Promise<Record<string, never>>;
  };

  return {
    /** Reset the app to its default state, deleting all data */
    clear,
    /** Echo text to the server's console */
    echo,
    /** Invalidate cached data */
    dataRefresh,
  };
}
