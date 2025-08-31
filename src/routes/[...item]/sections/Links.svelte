<script lang="ts">
  import { Button, Select, TextInput } from '$components/base';
  import ItemCardGrid from '$components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '$components/chip';
  import { ItemPicker } from '$components/pickers';
  import itemId, { type ItemId } from '$lib/itemId';
  import { linkDisplayStyles } from '$lib/links';
  import type { ItemData } from '$lib/server/data/item';
  import type { LinksSection } from '$lib/server/data/item/section';
  import { capitalize } from '$lib/util';

  type Props = {
    portfolio: ItemData,
    section: LinksSection,
    editing: boolean,
    onchange: () => void,
  };

  const {
    portfolio,
    editing,
    section = $bindable(),
    onchange,
  }: Props = $props();

  let newLinkId: ItemId = $state(itemId.ROOT);

  function addNewLink() {
    section.items.push(newLinkId);
    // newLinkId = itemId.ROOT;
    onchange();
  }
</script>

{#snippet display()}
  {#if section.style === 'chip'}
    <div class="link-chips">
      <h3>{section.label}</h3>
      <ItemChipList
        {portfolio}
        items={[section.items.map(i => ({ itemId: i, selected: false }))]}
        link={!editing}
      />
    </div>
  {:else}
    <h2>{section.label}</h2>
    <ItemCardGrid {portfolio} itemIds={section.items} {editing} />
  {/if}
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
      <label for="links-style">Display style</label>
      <Select id="links-style" bind:value={section.style}>
        {#each linkDisplayStyles as style}
          <option value={style}>{capitalize(style)}</option>
        {/each}
      </Select>
      <label for="links-item-picker">Add item</label>
      <div class="item-picker-control">
        <ItemPicker id="links-item-picker" {portfolio} bind:value={newLinkId} />
        <Button onclick={addNewLink}>Add</Button>
      </div>
    </div>
    {@render display()}
  </div>
{:else}
  {@render display()}
{/if}

<style>
  .link-chips {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .link-chips h3 {
    margin: 0;
  }

  .edit-outer {
    display: flex;
    flex-direction: column;
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

  .item-picker-control {
    display: flex;
    gap: 5px;
  }
</style>
