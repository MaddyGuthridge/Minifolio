<script lang="ts">
  import type { DocsSection } from '$lib/server/data/item/section';

  const { label, url }: DocsSection = $props();
</script>

<a href={url}>
  <i class="las la-book-open"></i>
  <b>{label ?? 'View the documentation'}</b>
</a>
