<script lang="ts">
  import { Button, TextInput } from '#lib/components/base/index.ts';
  import DataImage from '#lib/components/base/DataImage.svelte';
  import { ColorPicker, FilePicker, ItemPicker } from '#lib/components/pickers/index.ts';
  import consts from '#lib/consts.ts';
  import type { ItemData, ItemInfo } from '#lib/server/data/item/index.ts';
  import { itemFileUrl } from '#lib/urls.ts';
  import ItemFilesEdit from './ItemFilesEdit.svelte';
  import itemId, { type ItemId } from '#lib/itemId.ts';
  import api from '#lib/endpoints/index.ts';
  import { goto } from '$app/navigation';
  import { reportError } from '#lib/ui/toast/index.ts';

  type Props = {
    item: ItemId,
    thisItem: ItemData,
    portfolio: ItemData,
    onchange: (info: ItemInfo) => void,
  };

  let { thisItem = $bindable(), item, portfolio, onchange }: Props = $props();

  const isRootPage = $derived(item.length === 0);

  // FIXME: Make this only happen when committing to the server to prevent annoying bugs when
  // performing certain edits
  function commitChanges() {
    const info = thisItem.info;
    if (info.seo.description === '') {
      info.seo.description = null;
    }
    // info.seo.keywords = item.info.seo.keywords.filter(kw => kw.trim().length);
    onchange(info);
  }

  // svelte-ignore state_referenced_locally
  let changedItemId: string = $state(itemId.suffix(item));

  let moveParentId: ItemId = $state(itemId.ROOT);
</script>

<h1>Metadata</h1>
<form onsubmit={e => e.preventDefault()}>
  <h2>Name</h2>
  <TextInput
    placeholder={consts.APP_NAME}
    bind:value={thisItem.info.name}
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
    placeholder={thisItem.info.name}
    bind:value={thisItem.info.shortName}
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
    bind:value={thisItem.info.description}
    oninput={commitChanges}
    required
  />
  <p>A concise description of the item, shown on links to this page.</p>
  <h2>Color</h2>
  <ColorPicker bind:value={thisItem.info.color} oninput={commitChanges} required />
  <p>The theme color of the item is shown in the background of the page.</p>

  <h2>Banner image</h2>
  <FilePicker
    files={thisItem.ls}
    bind:selected={thisItem.info.banner}
    onchange={commitChanges}
  />
  <!-- Banner image -->
  {#if thisItem.info.banner}
    <div class="banner-image">
      <DataImage
        url={itemFileUrl(item, thisItem.info.banner)}
        alt={`Banner of ${thisItem.info.name}`}
      />
    </div>
  {/if}

  <h2>Icon image</h2>
  <FilePicker
    files={thisItem.ls}
    bind:selected={thisItem.info.icon}
    onchange={commitChanges}
  />
  <!-- Icon image -->
  {#if thisItem.info.icon}
    <div class="icon-image">
      <DataImage
        url={itemFileUrl(item, thisItem.info.icon)}
        alt={`Icon of ${thisItem.info.name}`}
      />
    </div>
  {/if}
</form>

<h2>Files</h2>
<ItemFilesEdit itemId={item} bind:files={thisItem.ls} />

<div class="change-item-id">
  <h2>Change ID</h2>
  <p>
    Change the identifier of this item, essentially changing its URL.
    Note that this will not create a redirect.
  </p>
  <span class="horizontal">
    <TextInput
      placeholder={item}
      bind:value={changedItemId}
      required
    />
    <Button onclick={async () => {
      const newLocation = itemId.child(itemId.parent(item), changedItemId);
      await reportError(
        () => api().item(item).info.move(newLocation),
        'Unable to change item ID',
        { handleError: false },
      );
      await goto(newLocation);
    }}>Change ID</Button>
  </span>
</div>

<div class="move-item">
  <h2>Move</h2>
  <p>
    Change the identifier of this item, essentially changing its URL.
    Note that this will not create a redirect.
  </p>
  <span class="horizontal">
    <ItemPicker id="item-destination-picker" {portfolio} bind:value={moveParentId} />
    <Button onclick={async () => {
      const newLocation = itemId.child(moveParentId, itemId.suffix(item));
      await reportError(
        () => api().item(item).info.move(newLocation),
        'Unable to move item',
        { handleError: false },
      );
      await goto(newLocation);
    }}>Move</Button>
  </span>
</div>

<div class="delete-item">
  <h2>Delete item</h2>
  <p>Permanently delete this item.</p>
  <Button mode="warning" onclick={async () => {
    await reportError(
      () => api().item(item).info.delete(),
      'Unable to delete item',
      { handleError: false },
    );
    await goto(itemId.ROOT);
  }}>Delete</Button>
</div>

<style>
  form {
    width: 100%;
  }

  h2 {
    margin-top: 50px;
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

  .horizontal {
    display: flex;
    gap: 5px;
  }
</style>
