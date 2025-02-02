/** Text endpoints for the server */

import { apiFetch } from '$endpoints/fetch';
import { type ItemId } from '$lib/itemId';

export function root(): Promise<string> {
  return apiFetch(fetch, 'GET', '/').text();
}

export function about(token?: string): Promise<string> {
  return apiFetch(fetch, 'GET', '/about', {token}).text();
}

export function item(itemId: ItemId): Promise<string> {
  return apiFetch(fetch, 'GET', itemId).text();
}

export function admin(token: string | undefined): Promise<string> {
  return apiFetch(fetch, 'GET', '/admin', {token}).text();
}

export default {
  root,
  about,
  item,
  admin,
};
