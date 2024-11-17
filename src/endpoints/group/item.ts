/** Item management endpoints */

import { apiFetch, json } from '$endpoints/fetch';
import type { ItemInfoBrief, ItemInfoFull } from '$lib/server/data/itemOld';

export default function makeItemFunctions(token: string | undefined, groupId: string) {
  /**
   * Return brief info about all items
   *
   * @returns mappings of items
   */
  const all = async () => {
    return json(apiFetch(
      'GET',
      `/api/group/${groupId}/item`,
      token,
    )) as Promise<Record<string, ItemInfoBrief>>;
  };

  const withId = (itemId: string) => {
    const create = async (name: string, description: string) => {
      return json(apiFetch(
        'POST',
        `/api/group/${groupId}/item/${itemId}`,
        token,
        { name, description },
      )) as Promise<Record<string, never>>;
    };

    const remove = async () => {
      return json(apiFetch(
        'DELETE',
        `/api/group/${groupId}/item/${itemId}`,
        token,
      )) as Promise<Record<string, never>>;
    };

    const getInfo = async () => {
      return json(apiFetch(
        'GET',
        `/api/group/${groupId}/item/${itemId}`,
        token,
      )) as Promise<ItemInfoFull>;
    };

    const setInfo = async (newInfo: ItemInfoFull) => {
      return json(apiFetch(
        'PUT',
        `/api/group/${groupId}/item/${itemId}`,
        token,
        newInfo,
      )) as Promise<Record<string, never>>;
    };

    const getReadme = async () => {
      return json(apiFetch(
        'GET',
        `/api/group/${groupId}/item/${itemId}/readme`,
        token,
      )) as Promise<{ readme: string }>;
    };

    const setReadme = async (readme: string) => {
      return json(apiFetch(
        'PUT',
        `/api/group/${groupId}/item/${itemId}/readme`,
        token,
        { readme },
      )) as Promise<Record<string, never>>;
    };

    const createLink = async (otherGroupId: string, otherItemId: string) => {
      return json(apiFetch(
        'POST',
        `/api/group/${groupId}/item/${itemId}/link`,
        token,
        { otherGroupId, otherItemId },
      )) as Promise<Record<string, never>>;
    };

    const updateLinkStyle = async (otherGroupId: string, style: 'chip' | 'card') => {
      return json(apiFetch(
        'PUT',
        `/api/group/${groupId}/item/${itemId}/link`,
        token,
        { otherGroupId, style },
      )) as Promise<Record<string, never>>;
    };

    const removeLink = async (otherGroupId: string, otherItemId: string) => {
      return json(apiFetch(
        'DELETE',
        `/api/group/${groupId}/item/${itemId}/link`,
        token,
        { otherGroupId, otherItemId },
      )) as Promise<Record<string, never>>;
    };

    return {
      /**
       * Create a new item
       *
       * @param token The authentication token
       * @param name The name of the item
       * @param description The description of the item
       */
      create,
      /**
       * Remove a item
       *
       * @param token The authentication token
       */
      remove,
      info: {
        /**
         * Return info on a particular item
         *
         * @returns info about the item
         */
        get: getInfo,
        /**
         * Update info on a particular item
         *
         * @param info info about the item
         */
        set: setInfo,
      },
      readme: {
        /**
         * Returns the README.md of the given item
         *
         * @returns readme.md of item
         */
        get: getReadme,
        /**
         * Updates the README.md of the given item
         *
         * @param token Auth token
         * @param readme README.md contents
         */
        set: setReadme,
      },
      /** Manage links to other items */
      links: {
        /** Create a link between this item and another item */
        create: createLink,
        /** Remove a link between this item and another item */
        remove: removeLink,
        /** Change the style for links to items in a group */
        style: updateLinkStyle,
      }
    };
  };

  return {
    all,
    withId,
  };
}
