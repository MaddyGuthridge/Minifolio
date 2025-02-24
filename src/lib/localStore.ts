/**
 * A Svelte store that is backed by localStorage.
 *
 * https://stackoverflow.com/a/68785061/6335363
 */

import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';

const storage = <T>(key: string, initValue: T): Writable<T> => {
  const store = writable(initValue);
  if (!browser) return store;

  const storedValueStr = localStorage.getItem(key);
  if (storedValueStr !== null) store.set(JSON.parse(storedValueStr));

  store.subscribe((val) => {
    if (([null, undefined] as (T | undefined | null)[]).includes(val)) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  });

  window.addEventListener('storage', () => {
    const storedValueStr = localStorage.getItem(key);
    if (storedValueStr === null) return;

    const localValue: T = JSON.parse(storedValueStr);
    if (localValue !== get(store)) store.set(localValue);
  });

  return store;
};

export default storage;
