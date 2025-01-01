/** API endpoints */
import type { ItemId } from '$lib/server/data/itemId';
import admin from './admin';
import config from './config';
import debug from './debug';
import item from './item';

/** Create an instance of the API client with the given token */
export default function api(token?: string) {
  return {
    /** Admin endpoints */
    admin: admin(token),
    /** Debug endpoints (only available in dev mode) */
    debug: debug(token),
    /** Site configuration */
    config: config(token),
    /** Item data endpoints */
    item: (itemId: ItemId) => item(token, itemId),
    /** Create a new API client with the given token */
    withToken: (token: string | undefined) => api(token),
    /** The token currently being used for this API client */
    token,
  };
}

/** API client type */
export type ApiClient = ReturnType<typeof api>;
