/**
 * contentObserver.ts
 *
 * Contains an observer system so that various parts of the front-end can be notified of changes
 * to files on the back-end, and automatically reload themselves.
 */

/** Callback function to notify subscriber that the contents of a file has changed */
type SubscriberCallback = () => void;

/** Internal data representing a subscriber */
type SubscriberEntry = {
  /** Unique ID for this subscriber */
  id: number;
  /** Callback function */
  callback: SubscriberCallback;
};

/** Record containing info about all current subscribers */
const observerData: Record<string, SubscriberEntry[]> = {};

let nextSubscriberId = 0;

/**
 * Subscribe to updates for the given content path.
 *
 * Returns an unsubscribe callback.
 */
export function subscribeToContent(path: string, callback: SubscriberCallback) {
  observerData[path] = observerData[path] ?? [];
  const id = nextSubscriberId++;
  observerData[path].push({ id, callback });

  return () => {
    observerData[path] = observerData[path].filter(subscriber => subscriber.id !== id);
  }
}

/** Notify subscribers of a change to the given file */
export function notifyContentUpdate(path: string) {
  (observerData[path] || []).forEach(subscriber => {
    subscriber.callback();
  });
}

/** Returns the state of the contentObserver system, for debugging */
export function getObserverState() {
  return observerData;
}
