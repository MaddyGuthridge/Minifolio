<script lang="ts">
  import type { HeadingSection } from '#lib/server/data/item/section.ts';

  type Props = {
    section: HeadingSection,
  };

  const { section }: Props = $props();
</script>

<h2>{section.heading}</h2>
<hr />

<style>
  h2 {
    font-size: 3rem;
    margin: 10px;
  }
</style>
