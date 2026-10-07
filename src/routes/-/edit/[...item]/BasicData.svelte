<script lang="ts">
  import { TextInput } from '$components/base';
  import DataImage from '$components/base/DataImage.svelte';
  import { ColorPicker, FilePicker } from '$components/pickers';
  import consts from '$lib/consts';
  import type { ItemId } from '$lib/itemId';
  import type { ItemData, ItemInfo } from '$lib/server/data/item';
  import { itemFileUrl } from '$lib/urls';

  type Props = {
    itemId: ItemId,
    item: ItemData,
    onchange: (info: ItemInfo) => void,
  };

  let { item = $bindable(), itemId, onchange }: Props = $props();

  const isRootPage = $derived(itemId.length === 0);

  // FIXME: Make this only happen when committing to the server to prevent annoying bugs when
  // performing certain edits
  function commitChanges() {
    const info = item.info;
    if (info.seo.description === '') {
      info.seo.description = null;
    }
    // info.seo.keywords = item.info.seo.keywords.filter(kw => kw.trim().length);
    onchange(info);
  }
</script>

<form onsubmit={e => e.preventDefault()}>
  <h2>Name</h2>
  <TextInput
    placeholder={consts.APP_NAME}
    bind:value={item.info.name}
    oninput={commitChanges}
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
  <TextInput
    placeholder={item.info.name}
    bind:value={item.info.shortName}
    oninput={commitChanges}
  />
  <p>
    {#if isRootPage}
      The shortened name of your portfolio site.
    {:else}
      The shortened name of the item.
    {/if} This is displayed in the navigator when viewing child pages.
  </p>
  <h2>Description</h2>
  <TextInput
    placeholder="A concise description."
    bind:value={item.info.description}
    oninput={commitChanges}
    required
  />
  <p>A concise description of the item, shown on links to this page.</p>
  <h2>Color</h2>
  <ColorPicker bind:value={item.info.color} oninput={commitChanges} required />
  <p>The theme color of the item is shown in the background of the page.</p>

  <h2>Banner image</h2>
  <FilePicker
    files={item.ls}
    bind:selected={item.info.banner}
    onchange={commitChanges}
  />
  <!-- Banner image -->
  {#if item.info.banner}
    <div class="banner-image">
      <DataImage
        url={itemFileUrl(itemId, item.info.banner)}
        alt={`Banner of ${item.info.name}`}
      />
    </div>
  {/if}

  <h2>Icon image</h2>
  <FilePicker
    files={item.ls}
    bind:selected={item.info.icon}
    onchange={commitChanges}
  />
  <!-- Icon image -->
  {#if item.info.icon}
    <div class="icon-image">
      <DataImage
        url={itemFileUrl(itemId, item.info.icon)}
        alt={`Icon of ${item.info.name}`}
      />
    </div>
  {/if}
</form>

<style>
  form {
    width: 100%;
  }

  .banner-image {
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    margin: 10px;
  }
  .icon-image {
    max-width: 30%;
    border-radius: 10px;
    overflow: hidden;
    margin: 10px;
  }
</style>
