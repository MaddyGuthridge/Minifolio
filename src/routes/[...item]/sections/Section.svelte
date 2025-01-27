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
    /** Called when section is deleted */
    ondelete: () => void;
  };

  let {
    section = $bindable(),
    editing,
    portfolio,
    onchange,
    ondelete,
  }: Props = $props();
</script>

<div class={editing ? 'bordered section-outer' : 'section-outer'}>
  <div class="section-inner">
    {#if section.type === 'package'}
      <Package {...section} />
    {:else if section.type === 'docs'}
      <Docs {...section} {editing} />
    {:else if section.type === 'site'}
      <Site {...section} {editing} />
    {:else if section.type === 'repo'}
      <Repo bind:repo={section} {editing} {onchange} />
    {:else if section.type === 'heading'}
      <Heading {section} {editing} {onchange} />
    {:else if section.type === 'links'}
      <Links {...section} {editing} {portfolio} />
    {/if}
  </div>
  {#if editing}
    <span class="grow"></span>
    <button
      aria-label="Delete section"
      class="delete-button"
      onclick={ondelete}
    >
      <i class="las la-trash"></i>
    </button>
  {/if}
</div>

<style>
  .section-outer {
    display: flex;
    align-items: center;

    gap: 10px;
    margin: 30px;
    padding: 10px;
  }

  .section-inner {
    min-width: 50vw;
  }

  .bordered {
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }

  .grow {
    flex-grow: 1;
  }

  .delete-button {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
</style>
