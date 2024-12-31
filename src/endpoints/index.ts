/** API endpoints */
import type { ItemId } from '$lib/server/data/itemId';
import admin from './admin';
import debug from './debug';
import item from './item';

/** Create an instance of the API client with the given token */
export default function api(token?: string) {
  return {
    admin: admin(token),
    debug: debug(token),
    item: (itemId: ItemId) => item(token, itemId),
    /** Create a new API client with the given token */
    withToken: (token: string | undefined) => api(token),
    /** The token currently being used for this API client */
    token,
  };
}

/** API client type */
export type ApiClient = ReturnType<typeof api>;
