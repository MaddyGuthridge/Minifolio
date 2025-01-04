<script lang="ts">
  import type { SiteSection } from '$lib/server/data/item/section';

  const { title, url }: SiteSection = $props();
</script>

<a href={url}>
  <b>{title}</b>
</a>
