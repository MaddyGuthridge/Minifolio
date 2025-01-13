<script lang="ts">
  import type { HeadingSection } from '$lib/server/data/item/section';

  const { heading }: HeadingSection = $props();
</script>

<h2>{heading}</h2>
