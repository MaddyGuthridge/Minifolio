<script lang="ts">
  import { subscribeToContent } from '$lib/contentObserver';
  import { onMount } from 'svelte';

  type Props = {
    url: string;
    alt: string;
  };

  const { url, alt }: Props = $props();

  let unsubscribe: (() => void) | undefined = undefined;

  // https://stackoverflow.com/a/9943419/6335363
  const makeImageUrl = (url: string) => `${url}#${new Date().getTime()}`;

  let imageUrl = $state(makeImageUrl(url));

  function triggerImageReload() {
    imageUrl = makeImageUrl(url);
  }

  onMount(() => {
    // Subscribe and store the unsubscribe callback
    unsubscribe = subscribeToContent(url, triggerImageReload);

    return () => {
      // If we need to unsubscribe, do so
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  // Watch `path`, and re-subscribe when it changes, and reset the imageUrl
  $effect(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = subscribeToContent(url, triggerImageReload);
    imageUrl = makeImageUrl(url);
  });
</script>

<img src={imageUrl} {alt} />

<style>
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
