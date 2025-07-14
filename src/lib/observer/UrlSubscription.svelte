<script lang="ts">
  import { subscribeToContent } from './contentObserver';

  type Props = {
    /** URL to subscribe to */
    url: string,
    /**
     * Bindable URL to use in parent component -- it will update whenever the content at the URL
     * changes.
     */
    derivedUrl: string,
  };

  let { url, derivedUrl = $bindable() }: Props = $props();

  // Adding the current time as a fragment to the URL, to skip the browser cache, without
  // skipping server-side caches.
  // https://stackoverflow.com/a/9943419/6335363
  const makeUrl = (url: string) => `${url}#${new Date().getTime()}`;

  function triggerReload() {
    derivedUrl = makeUrl(url);
  }

  // Watch `url`, and re-subscribe when it changes, and reset the derivedUrl
  $effect(() => {
    const unsubscribe = subscribeToContent(url, triggerReload);
    derivedUrl = makeUrl(url);

    return unsubscribe;
  });
</script>

<!--
  @component

  Subscribe to a URL, so that the browser is forced to reload content at that URL when its content
  is modified.

  This can be used for content such as images, videos and audio (things which are fetched by the
  browser).
-->
