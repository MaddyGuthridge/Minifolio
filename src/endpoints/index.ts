/** API endpoints */
import type { ItemId } from '$lib/itemId';
import admin from './admin';
import config from './config';
import debug from './debug';
import { apiFetch } from './fetch';
import item from './item';
import page from './pages';
import robotsTxt from './robots.txt';

export function sitemap(fetchFn: typeof fetch, token: string | undefined) {
  return apiFetch(fetchFn, 'GET', '/sitemap.xml', { token }).xml();
}

/** Create an instance of the API client with the given token */
export default function api(fetchFn: typeof fetch = fetch, token?: string) {
  return {
    /** Admin endpoints */
    admin: admin(fetchFn, token),
    /** Debug endpoints (only available in dev mode) */
    debug: debug(fetchFn, token),
    /** Site configuration */
    config: config(fetchFn, token),
    /** Item data endpoints */
    item: (itemId: ItemId) => item(fetchFn, token, itemId),
    /** Sitemap.xml, converted to JS object */
    sitemap: () => sitemap(fetchFn, token),
    /** robots.txt file */
    robots: robotsTxt(fetchFn, token),
    /** An HTML page */
    page: page(fetchFn, token),
    /** Create a new API client with the given token */
    withToken: (token: string | undefined) => api(fetchFn, token),
    /** The token currently being used for this API client */
    token,
  };
}

/** API client type */
export type ApiClient = ReturnType<typeof api>;
