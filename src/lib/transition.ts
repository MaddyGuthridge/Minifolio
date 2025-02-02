/**
 * Deferred transitions to allow elements to smoothly transition between
 * locations.
 *
 * Source: https://learn.svelte.dev/tutorial/deferred-transitions
 */

import { crossfade } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

export const [send, receive] = crossfade({
  duration: (d) => Math.sqrt(d * 200),

  fallback(node /*, params */) {
    const style = getComputedStyle(node);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      duration: 600,
      easing: quintOut,
      css: (t) => `
        opacity: ${t};
      `
    };
  }
});
