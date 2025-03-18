/** Text endpoints for the server */

import { apiFetch } from '$endpoints/fetch';
import { type ItemId } from '$lib/itemId';

export default function page(fetchFn: typeof fetch, token: string | undefined) {
  return {
    /** The root page */
    root: async () => {
      return apiFetch(fetchFn, 'GET', '/', {token}).text();
    },
    /** The about page */
    about: async () => {
      return apiFetch(fetchFn, 'GET', '/about', {token}).text();
    },
    /** The page for a specific item */
    item: async (itemId: ItemId) => {
      return apiFetch(fetchFn, 'GET', itemId).text();
    },
    /** The admin page */
    admin: async () => {
      return apiFetch(fetchFn, 'GET', '/admin', {token}).text();
    },
    /** AT Protocol decentralized ID */
    atProtoDid: async () => {
      return apiFetch(fetchFn, 'GET', '/.well-known/atproto-did', {token}).text();
    },
  };
}
