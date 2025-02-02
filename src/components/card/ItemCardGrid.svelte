<script lang="ts">
  import { flip } from 'svelte/animate';
  import { ItemCard } from '.';
  import { send, receive } from '$lib/transition';
  import { type ItemId } from '$lib/itemId';
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
    /** Called when an item was dropped into this grid. Can be used to remove it from elsewhere. */
    onDropItem?: (itemId: ItemId) => void;
  };

  let {
    portfolio,
    itemIds,
    onclick,
    editing,
    dndId,
    onReorder,
    onDropItem,
  }: Props = $props();

  function handleDrop(itemId: ItemId, info: DndInfo) {
    if (info.dndId !== dndId) {
      // Doesn't match, do nothing
      return;
    }
    const prevIndex = itemIds.findIndex((id) => id === itemId);
    let newItemIds = itemIds.filter((id) => id !== itemId);
    if (info.itemId !== undefined) {
      const targetId = info.itemId;
      // Find location to splice it in
      const targetIndex = itemIds.findIndex((id) => id === targetId);
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
    onDropItem?.(itemId);
  }
</script>

<div
  use:drop={{
    canDrop: (e) => e.source.data.dndId === dndId,
    getData: () => ({ dndId, itemId: undefined }),
    onDrop: (e) => {
      // Send handleDrop the inner-most drop info
      handleDrop(
        e.source.data.itemId as ItemId,
        e.location.current.dropTargets[0].data as DndInfo,
      );
    },
  }}
>
  <div class="card-grid">
    {#each itemIds as itemId (itemId)}
      <div
        animate:flip={{ duration: 300 }}
        in:receive={{ key: itemId }}
        out:send={{ key: itemId }}
      >
        <ItemCard
          item={getDescendant(portfolio, itemId).info}
          link={!editing}
          {itemId}
          onclick={() => onclick?.(itemId)}
          {dndId}
        />
      </div>
    {/each}
  </div>
  <!-- No child items -->
  {#if itemIds.length === 0 && editing}
    <div class="no-items-message"><p>No items to show</p></div>
  {/if}
</div>

<style>
  .no-items-message {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 10px;
  }

  .card-grid {
    /* https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/ */
    /**
    * User input values.
    */
    --grid-layout-gap: 0px;
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
