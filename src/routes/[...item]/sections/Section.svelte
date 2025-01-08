<script lang="ts">
  import type { ItemData } from '$lib/server/data/item';
  import type { ItemSection } from '$lib/server/data/item/section';
  import Docs from './Docs.svelte';
  import Heading from './Heading.svelte';
  import Links from './Links.svelte';
  import Package from './Package.svelte';
  import Repo from './Repo.svelte';
  import Site from './Site.svelte';

  type Props = {
    section: ItemSection;
    editing: boolean;
    portfolio: ItemData;
  };

  const { section, editing, portfolio }: Props = $props();
</script>

{#if section.type === 'package'}
  <Package {...section} />
{:else if section.type === 'docs'}
  <Docs {...section} />
{:else if section.type === 'site'}
  <Site {...section} />
{:else if section.type === 'repo'}
  <Repo {...section} />
{:else if section.type === 'heading'}
  <Heading {...section} />
{:else if section.type === 'links'}
  <Links {...section} {editing} {portfolio} />
{/if}
