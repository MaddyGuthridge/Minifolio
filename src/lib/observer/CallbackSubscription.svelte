<script lang="ts" module>
  // Make T be defined to prevent eslint errors
  // https://stackoverflow.com/a/78981916/6335363
  type T = any;
</script>

<script lang="ts" generics="T">
  import { subscribeToContent } from './contentObserver';

  type Props = {
    /** URL to subscribe to */
    url: string;
    /** Function to call when reloading data */
    reloadFn: () => Promise<T>;
    /**
     * Original value -- used before the reload function has been resolved. If this value is updated,
     * it will cause an update for `value`.
     */
    originalValue: T,
    /**
     * Bindable prop to store data results in -- it will update whenever the content at the URL
     * changes.
     */
    value: T;
  };

  let { url, reloadFn, originalValue, value = $bindable() }: Props = $props();

  // Prevent load on mount, since the data is already correct then
  let firstLoad = true;

  // Need to use a function to generate the reload trigger, so that the `reloadFn` can be
  // observed using the $effect
  function triggerReload(reloadFn: () => Promise<T>) {
    const doReload = () => {
      void reloadFn().then((newValue) => {
        value = newValue;
      });
    };
    if (firstLoad) {
      firstLoad = false;
    } else {
      doReload();
    }
    return doReload;
  }

  $effect(() => subscribeToContent(url, triggerReload(reloadFn)));

  $effect(() => {
    value = originalValue;
  });
</script>
<!--
  @component

  Subscribe to a URL, so that the supplied async callback is used whenever its content is modified.
  The awaited return value of the callback is exported as the `value` attribute.
-->
