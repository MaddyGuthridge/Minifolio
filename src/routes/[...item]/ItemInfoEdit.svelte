<script lang="ts">
  import FilePicker from '$components/pickers/FilePicker.svelte';
  import consts from '$lib/consts';
  import type { ItemId } from '$lib/itemId';
  import type { ItemData, ItemInfo } from '$lib/server/data/item';
  import { itemFileUrl } from '$lib/urls';

  type Props = {
    itemId: ItemId;
    item: ItemData;
    onchange: (info: ItemInfo) => void;
  };

  let { item = $bindable(), itemId, onchange }: Props = $props();

  let isRootPage = $derived(itemId.length === 0);
</script>

<form onsubmit={(e) => e.preventDefault()}>
  <h2>Name</h2>
  <input
    type="text"
    placeholder={consts.APP_NAME}
    bind:value={item.info.name}
    oninput={() => onchange(item.info)}
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
    oninput={() => onchange(item.info)}
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
    oninput={() => onchange(item.info)}
    required
  />
  <p>A concise description of the item, shown on links to this page.</p>
  <h2>Color</h2>
  <input
    type="color"
    bind:value={item.info.color}
    oninput={() => onchange(item.info)}
    required
  />
  <p>The theme color of the item is shown in the background of the page.</p>

  <h2>Banner image</h2>
  <FilePicker
    files={item.ls}
    bind:selected={item.info.banner}
    onchange={() => onchange(item.info)}
  />
  <!-- Banner image -->
  {#if item.info.banner}
    <p>
      <img
        src={itemFileUrl(itemId, item.info.banner)}
        alt={`Banner of ${item.info.name}`}
        class="banner-image"
      />
    </p>
  {/if}

  <h2>Icon image</h2>
  <FilePicker
    files={item.ls}
    bind:selected={item.info.icon}
    onchange={() => onchange(item.info)}
  />
  <!-- Banner image -->
  {#if item.info.icon}
    <p>
      <img
        src={itemFileUrl(itemId, item.info.icon)}
        alt={`Icon of ${item.info.name}`}
        class="icon-image"
      />
    </p>
  {/if}
</form>

<style>
  form {
    width: 100%;
  }

  .banner-image {
    max-width: 80%;
    height: 30vh;
    border-radius: 10px;
  }
  .icon-image {
    max-width: 80%;
    height: 30vh;
    border-radius: 10px;
  }
</style>
