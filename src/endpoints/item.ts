import type { ItemData, ItemInfo } from '$lib/server/data/item';
import { type ItemId } from '$lib/itemId';
import { apiFetch, payload } from './fetch';

export default function item(fetchFn: typeof fetch, token: string | undefined, itemId: ItemId) {
  if (itemId === '/') {
    itemId = '' as ItemId;
  }

  const info = {
    /** Get the `info.json` content of the given item. */
    get: async () => {
      return apiFetch(
        fetchFn,
        'GET',
        `/data${itemId}/info.json`,
        { token },
      ).json() as Promise<ItemInfo>;
    },
    /** Create a new item with the given properties. */
    post: async (name: string, description?: string) => {
      return apiFetch(
        fetchFn,
        'POST',
        `/data${itemId}/info.json`,
        { token, ...payload.json({ name, description: description ?? '' }) },
      ).json();
    },
    /** Update the `info.json` of the given item. */
    put: async (info: ItemInfo) => {
      return apiFetch(
        fetchFn,
        'PUT',
        `/data${itemId}/info.json`,
        { token, ...payload.json(info) },
      ).json();
    },
    /** Delete the given item. */
    delete: async () => {
      return apiFetch(
        fetchFn,
        'DELETE',
        `/data${itemId}/info.json`,
        { token },
      ).json();
    },
  };

  const readme = {
    /** Get the `README.md` of the given item */
    get: async () => {
      return apiFetch(
        fetchFn,
        'GET',
        `/data${itemId}/README.md`,
        { token },
      ).text();
    },
    /** Update the `README.md` of the given item */
    put: async (readme: string) => {
      return apiFetch(
        fetchFn,
        'PUT',
        `/data${itemId}/README.md`,
        { token, ...payload.markdown(readme) },
      ).json();
    },
  };

  const file = (filename: string) => ({
    /** Get the contents of the given file */
    get: async () => {
      return apiFetch(
        fetchFn,
        'GET',
        `/data${itemId}/${filename}`,
        { token }
      ).buffer();
    },
    /** Create a file at the given path */
    post: async (file: File) => {
      return apiFetch(
        fetchFn,
        'POST',
        `/data${itemId}/${filename}`,
        { token, ...payload.file(file) },
      ).json();
    },
    /** Update the contents of a file at the given path */
    put: async (file: File) => {
      return apiFetch(
        fetchFn,
        'PUT',
        `/data${itemId}/${filename}`,
        { token, ...payload.file(file) },
      ).json();
    },
    /** Remove the file at the given path */
    delete: async () => {
      return apiFetch(
        fetchFn,
        'DELETE',
        `/data${itemId}/${filename}`,
        { token },
      ).json();
    },
  });

  return {
    /** `info.json` of the item */
    info,
    /** `README.md` of the item */
    readme,
    /** A file belonging to the item */
    file,
    /** The full recursive item data */
    data: async () => {
      return apiFetch(
        fetchFn,
        'GET',
        `/data/${itemId}`,
        { token },
      ).json() as Promise<ItemData>;
    }
  };
}
