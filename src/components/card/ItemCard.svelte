<script lang="ts">
  import Card from './Card.svelte';
  import type { ItemInfo } from '$lib/server/data/item';
  import type { ItemId } from '$lib/itemId';
  import { itemFileUrl, itemUrl } from '$lib/urls';

  type Props = {
    /** Item info to display */
    item: ItemInfo;
    /** ID of item to link to */
    itemId: ItemId;
    /** Whether to link to the given item */
    link: boolean;
    /** Callback for when the element is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void;
  };

  let { item, itemId, link, onclick }: Props = $props();
</script>

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
