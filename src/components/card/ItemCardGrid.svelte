<script lang="ts">
  import { flip } from 'svelte/animate';
  import { ItemCard } from '.';
  import { send, receive } from '$lib/transition';
  import { itemIdsEqual, itemIdToUrl, type ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';
  import { getDescendant } from '$lib/itemData';
  import { drop } from '$lib/ui';
  import type { DndInfo } from './dndTypes';

  type Props = {
    portfolio: ItemData;
    /** Item IDs to show */
    itemIds: ItemId[];
    /** Called when an item is clicked */
    onclick?: (itemId: ItemId) => void;
    /** Whether edit mode is active*/
    editing: boolean;
    /** Unique drag-and-drop ID, used to prevent items from being dropped between incompatible areas */
    dndId?: string;
    /** Called when items are re-ordered */
    onReorder?: (itemIds: ItemId[]) => void;
  };

  let { portfolio, itemIds, onclick, editing, dndId, onReorder }: Props =
    $props();

  function handleDrop(itemId: ItemId, info: DndInfo) {
    if (info.dndId !== dndId) {
      // Doesn't match, do nothing
      return;
    }
    const prevIndex = itemIds.findIndex((id) => itemIdsEqual(id, itemId));
    let newItemIds = itemIds.filter((id) => !itemIdsEqual(id, itemId));
    if (info.itemId !== undefined) {
      const targetId = info.itemId;
      // Find location to splice it in
      const targetIndex = itemIds.findIndex((id) => itemIdsEqual(id, targetId));
      if (prevIndex > targetIndex) {
        if (targetIndex > 0) {
          newItemIds.splice(targetIndex, 0, itemId);
        } else {
          newItemIds = [itemId, ...newItemIds];
        }
      } else {
        newItemIds.splice(targetIndex, 0, itemId);
      }
    } else {
      // Not dropped onto an item => place at end of list
      newItemIds.push(itemId);
    }
    // Now update itemIds
    onReorder?.(newItemIds);
  }
</script>

<div
  class="card-grid"
  use:drop={{
    canDrop: (e) => e.source.data.dndId === dndId,
    getData: () => ({ dndId, itemId: undefined }),
  }}
>
  {#each itemIds as itemId (itemId)}
    <div
      animate:flip={{ duration: 300 }}
      in:receive={{ key: itemIdToUrl(itemId) }}
      out:send={{ key: itemIdToUrl(itemId) }}
    >
      <ItemCard
        item={getDescendant(portfolio, itemId).info}
        link={!editing}
        {itemId}
        onclick={() => onclick?.(itemId)}
        {dndId}
        onDragAndDrop={(dndInfo) => handleDrop(itemId, dndInfo)}
      />
    </div>
  {/each}
</div>

<style>
  .card-grid {
    /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
    /**
    * User input values.
    */
    --grid-layout-gap: 20px;
    --grid-column-count: 3;
    --grid-item--min-width: 20em;

    /**
    * Calculated values.
    */
    --gap-count: calc(var(--grid-column-count) - 1);
    --total-gap-width: calc(var(--gap-count) * var(--grid-layout-gap));
    --grid-item--max-width: calc(
      (100% - var(--total-gap-width)) / var(--grid-column-count)
    );

    width: 100%;
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr)
    );
    grid-gap: var(--grid-layout-gap);
  }

  /* ✨ responsive design ✨ */
  @media only screen and (max-width: 600px) {
    .card-grid {
      display: flex;
      flex-direction: column;
      max-width: 100%;
    }
  }
</style>
