import { dev } from '$app/environment';
import api from '$endpoints';
import consts from '$lib/consts';
import { getObserverState, notifyContentUpdate } from '$lib/observer';

function helloWorld() {
  console.log(`%c${consts.APP_NAME}\n`, 'font-size: 3rem');
  console.log(`%cMade with <3 by ${consts.APP_AUTHOR[0]}`, 'font-size: 1.5rem');
  console.log(`Check out the code at\n${consts.APP_GITHUB}`);
}

/** When page is loaded, attempt to refresh the token if possible */
function refreshToken() {
  void api().admin.auth.refresh()
    .catch(() => {/* Ignore errors */});
}

export const init = () => {
  helloWorld();
  // In dev mode, attach some useful tools to the console
  if (dev) {
    // @ts-expect-error -- attach API controller
    globalThis.api = api();
    // @ts-expect-error -- attach content observer update function
    globalThis.observerNotify = notifyContentUpdate;
    // @ts-expect-error -- attach content observer get state function
    globalThis.observerState = getObserverState;
  }
  refreshToken();
}

