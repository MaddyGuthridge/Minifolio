<script lang="ts">
  import Card from './Card.svelte';
  import type { ItemInfo } from '$lib/server/data/item';
  import type { ItemId } from '$lib/itemId';
  import { itemFileUrl, itemUrl } from '$lib/urls';
  import { dragAndDrop } from '$lib/ui';
  import type { DndInfo } from './dndTypes';

  type Props = {
    /** Item info to display */
    item: ItemInfo;
    /** ID of item to link to */
    itemId: ItemId;
    /** Whether to link to the given item */
    link: boolean;
    /** Callback for when the element is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void;
    /** Unique ID to use for drag-and-drop operations */
    dndId?: string;
    /** Called when this item is dragged and dropped somewhere */
    onDragAndDrop?: (info: DndInfo) => void;
  };

  let { item, itemId, link, onclick, dndId, onDragAndDrop }: Props = $props();
</script>

<div
  use:dragAndDrop={{
    drag: {
      canDrag: () => dndId !== undefined,
      getInitialData: () => ({ dndId, itemId }),
      onDrop: (e) => {
        // If there is a valid drop target
        if (e.location.current.dropTargets.length) {
          // Send drop target info
          onDragAndDrop?.(e.location.current.dropTargets[0].data as DndInfo);
        }
      },
    },
    drop: {
      canDrop: (e) => dndId === e.source.data.dndId,
      getData: () => ({ dndId, itemId }),
    },
  }}
>
  <Card
    color={item.color}
    {onclick}
    link={link ? { url: itemUrl(itemId), newTab: false } : undefined}
  >
    <div class="card-outer">
      <div class:card-icon={item.icon}>
        {#if item.icon}
          <img
            src={itemFileUrl(itemId, item.icon)}
            alt="Icon for {item.name}"
            class="label-icon"
          />
        {/if}
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      </div>
    </div>
  </Card>
</div>

<style>
  h3 {
    margin-bottom: 0;
  }

  .card-outer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .card-icon {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .label-icon {
    width: 100%;
    border-radius: 15px;
  }
</style>
