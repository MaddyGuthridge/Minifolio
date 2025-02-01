<script lang="ts">
  import { flip } from 'svelte/animate';
  import { ItemCard } from '.';
  import { send, receive } from '$lib/transition';
  import type { ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';
  import { getDescendant } from '$lib/itemData';

  type Props = {
    portfolio: ItemData;
    /** Item IDs to show */
    itemIds: ItemId[];
    /** Called when an item is clicked */
    onclick?: (itemId: ItemId) => void;
    /** Whether edit mode is active*/
    editing: boolean;
  };

  let { portfolio, itemIds, onclick, editing }: Props = $props();
</script>

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
    --grid-item--min-width: 30em;

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
