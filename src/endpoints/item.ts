import type { ItemInfo } from '$lib/server/data/item';
import { itemIdToUrl, type ItemId } from '$lib/server/data/itemId';
import { apiFetch, payload } from './fetch';

export default function item(token: string | undefined, itemId: ItemId) {
  const info = {
    /** Get the `info.json` content of the given item. */
    get: async () => {
      return apiFetch(
        'GET',
        `/data/${itemIdToUrl(itemId, 'info.json')}`,
        { token },
      ).json() as Promise<ItemInfo>;
    },
    /** Create a new item with the given properties. */
    post: async (name: string, description?: string) => {
      return apiFetch(
        'POST',
        `/data/${itemIdToUrl(itemId, 'info.json')}`,
        { token, ...payload.json({ name, description: description ?? '' }) },
      ).json();
    },
    /** Update the `info.json` of the given item. */
    put: async (info: ItemInfo) => {
      return apiFetch(
        'PUT',
        `/data/${itemIdToUrl(itemId, 'info.json')}`,
        { token, ...payload.json(info) },
      ).json();
    },
    /** Delete the given item. */
    delete: async () => {
      return apiFetch(
        'DELETE',
        `/data/${itemIdToUrl(itemId, 'info.json')}`,
        { token },
      ).json();
    },
  };

  const readme = {
    /** Get the `README.md` of the given item */
    get: async () => {
      return apiFetch(
        'GET',
        `/data/${itemIdToUrl(itemId, 'README.md')}`,
        { token },
      ).text();
    },
    /** Update the `README.md` of the given item */
    put: async (readme: string) => {
      return apiFetch(
        'PUT',
        `/data/${itemIdToUrl(itemId, 'README.md')}`,
        { token, ...payload.markdown(readme) },
      ).json();
    },
  };

  return {
    /** `info.json` of the item */
    info,
    /** `README.md` of the item */
    readme,
  };
}
