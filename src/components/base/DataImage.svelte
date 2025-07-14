<script lang="ts">
  import { UrlSubscription } from '$lib/observer';

  type Props = {
    url: string,
    alt: string,
  };

  const { url, alt }: Props = $props();

  let derivedUrl = $state(url);
</script>

<UrlSubscription {url} bind:derivedUrl />

<img src={derivedUrl} {alt} />

<style>
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
