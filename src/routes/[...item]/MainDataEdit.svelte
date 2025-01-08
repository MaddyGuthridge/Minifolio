<script lang="ts">
  import type { ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';

  type Props = {
    itemId: ItemId;
    item: ItemData;
  };

  let { item = $bindable(), itemId }: Props = $props();

  let isRootPage = $derived(itemId.length === 0);

  $inspect(item.info.color);
</script>

<form onsubmit={(e) => e.preventDefault()}>
  <h2>Name</h2>
  <input
    type="text"
    placeholder="The name of this item"
    bind:value={item.info.name}
    required
  />
  <p>
    {#if isRootPage}
      The full name of your portfolio site.
    {:else}
      The full name of the item.
    {/if}
  </p>
  <h2>Short name</h2>
  <input
    type="text"
    placeholder={item.info.name}
    bind:value={item.info.shortName}
    required
  />
  <p>
    {#if isRootPage}
      The shortened name of your portfolio site.
    {:else}
      The shortened name of the item.
    {/if} This is displayed in the navigator when viewing child pages.
  </p>
  <h2>Description</h2>
  <input
    type="text"
    placeholder="A concise description."
    bind:value={item.info.description}
    required
  />
  <p>A concise description of the item, shown on links to this page.</p>
  <h2>Color</h2>
  <input type="color" bind:value={item.info.color} required />
  <p>The theme color of the item is shown in the background of the page.</p>
</form>
