import { dev } from '$app/environment';
import api from '$endpoints';
import consts from '$lib/consts';

function helloWorld() {
  console.log(`%c${consts.APP_NAME}\n`, 'font-size: 3rem');
  console.log(`%cMade with <3 by ${consts.APP_AUTHOR[0]}`, 'font-size: 1.5rem');
  console.log(`Check out the code on\n${consts.APP_GITHUB}`);
}

export const init = () => {
  helloWorld();
  // In dev mode, attach the `endpoints` to the console
  if (dev) {
    // @ts-expect-error: Global variables are usually an anti-pattern, but this is very useful for
    // debugging, and so it is done in dev mode.
    globalThis.api = api();
  }
}

