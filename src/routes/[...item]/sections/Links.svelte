<script lang="ts">
  import { TextInput } from '$components/base';
  import ItemCardGrid from '$components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '$components/chip';
  import type { ItemData } from '$lib/server/data/item';
  import type { LinksSection } from '$lib/server/data/item/section';

  type Props = {
    portfolio: ItemData;
    section: LinksSection;
    editing: boolean;
    onchange: () => void;
  };

  const { portfolio, editing, section = $bindable(), onchange }: Props = $props();
</script>

{#snippet display()}
  <div>
    <b>{section.label}</b>
    {#if section.style === 'chip'}
      <ItemChipList
        {portfolio}
        items={[section.items.map((i) => ({ itemId: i, selected: false }))]}
        link
        onclick={() => {}}
        onfilter={() => {}}
      />
    {:else}
      <ItemCardGrid
        {portfolio}
        itemIds={section.items}
        {editing}
        onclick={() => {}}
      />
    {/if}
  </div>
{/snippet}

{#if editing}
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="links-label-text">Label text</label>
      <TextInput
        id="links-label-text"
        bind:value={section.label}
        oninput={onchange}
        placeholder={'See also'}
      />
    </div>
    {@render display()}
  </div>
{:else}
  {@render display()}
{/if}

<style>
  .edit-outer {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .edit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  label {
    display: flex;
    align-items: center;
  }
</style>
