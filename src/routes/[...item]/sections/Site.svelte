<script lang="ts">
  import type { SiteSection } from '$lib/server/data/item/section';

  const { label, url }: SiteSection = $props();
</script>

<a href={url}>
  <b>{label ?? 'Visit the website'}</b>
</a>
