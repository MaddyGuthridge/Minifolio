<script lang="ts">
  import type { ItemSection } from '$lib/server/data/item/section';
  import Docs from './Docs.svelte';
  import Package from './Package.svelte';
  import Repo from './Repo.svelte';
  import Site from './Site.svelte';

  type Props = {
    section: ItemSection;
  };

  const { section }: Props = $props();
</script>

{#if section.type === 'package'}
  <Package {...section} />
{:else if section.type === 'docs'}
  <Docs {...section} />
{:else if section.type === 'site'}
  <Site {...section} />
{:else if section.type === 'repo'}
  <Repo {...section} />
{/if}
