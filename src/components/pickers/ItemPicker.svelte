<script lang="ts">
  import { Select } from '$components/base';
  import { getDescendant } from '$lib/itemData';
  import itemId, { type ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';

  type Props = {
    portfolio: ItemData;
    value: ItemId;
    id?: string;
  };

  let { portfolio, value: value = $bindable(), id }: Props = $props();

  /** Select the item with the given ID fragment at the given depth */
  function setSelection(index: number, childId: string | undefined) {
    value = itemId.slice(value, 0, index);
    if (childId !== undefined) {
      value = itemId.child(value, childId);
    }
  }
</script>

{#snippet descendantOptions(index: number)}
  <Select
    bind:value={() => itemId.at(value, index),
    (newSelection) => setSelection(index, newSelection)}
  >
    <option value={undefined}
      >{index === 0 ? '-- Root --' : '-- This item --'}</option
    >
    {#each Object.entries(getDescendant(portfolio, itemId.slice(value, 0, index)).children) as [childId, child]}
      <option value={childId}>{child.info.name}</option>
    {/each}
  </Select>
{/snippet}

<div class="item-selector" {id}>
  <!-- Root item selection -->
  {@render descendantOptions(0)}
  <!-- Descendant item selection -->
  {#each itemId.components(value) as _, i}
    {@render descendantOptions(i + 1)}
  {/each}
</div>

<style>
  .item-selector {
    display: flex;
    gap: 5px;
    overflow-x: scroll;
  }
</style>
