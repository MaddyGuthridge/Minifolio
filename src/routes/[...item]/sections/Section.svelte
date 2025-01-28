<script lang="ts">
  import { Button } from '$components/base';
  import type { ItemData } from '$lib/server/data/item';
  import type { ItemSection } from '$lib/server/data/item/section';
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
      <Package bind:section {editing} {onchange} />
    {:else if section.type === 'site'}
      <Site bind:section {editing} {onchange} />
    {:else if section.type === 'repo'}
      <Repo bind:section {editing} {onchange} />
    {:else if section.type === 'heading'}
      <Heading bind:section {editing} {onchange} />
    {:else if section.type === 'links'}
      <Links {...section} {editing} {portfolio} />
    {/if}
  </div>
  {#if editing}
    <span class="grow"></span>
    <Button hint="Delete section" onclick={ondelete} mode="warning">
      <div class="delete-button">
        <i class="las la-trash"></i>
      </div>
    </Button>
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
