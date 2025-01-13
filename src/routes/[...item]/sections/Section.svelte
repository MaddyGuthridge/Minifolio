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
    /** Called when data changes*/
    onchange: () => void;
  };

  let { section = $bindable(), editing, portfolio, onchange }: Props = $props();
</script>

{#if section.type === 'package'}
  <Package {...section} />
{:else if section.type === 'docs'}
  <Docs {...section} {editing} />
{:else if section.type === 'site'}
  <Site {...section} {editing} />
{:else if section.type === 'repo'}
  <Repo bind:repo={section} {editing} {onchange} />
{:else if section.type === 'heading'}
  <Heading {...section} />
{:else if section.type === 'links'}
  <Links {...section} {editing} {portfolio} />
{/if}
