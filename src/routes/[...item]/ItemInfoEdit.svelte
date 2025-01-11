<script lang="ts">
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import type { ItemId } from '$lib/itemId';
  import type { ItemInfo } from '$lib/server/data/item';

  type Props = {
    itemId: ItemId;
    itemInfo: ItemInfo;
    onchange: (info: ItemInfo) => Promise<void>;
  };

  let { itemInfo = $bindable(), itemId, onchange }: Props = $props();

  let isRootPage = $derived(itemId.length === 0);

  let updater = new DelayedUpdater(async (info: ItemInfo) => {
    if (info.shortName === '') {
      info.shortName = null;
    }
    await onchange(info);
  }, consts.EDIT_COMMIT_HESITATION);
</script>

<form onsubmit={(e) => e.preventDefault()}>
  <h2>Name</h2>
  <input
    type="text"
    placeholder={consts.APP_NAME}
    bind:value={itemInfo.name}
    oninput={() => updater.update(itemInfo)}
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
    placeholder={itemInfo.name}
    bind:value={itemInfo.shortName}
    oninput={() => updater.update(itemInfo)}
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
    bind:value={itemInfo.description}
    oninput={() => updater.update(itemInfo)}
    required
  />
  <p>A concise description of the item, shown on links to this page.</p>
  <h2>Color</h2>
  <input
    type="color"
    bind:value={itemInfo.color}
    oninput={() => updater.update(itemInfo)}
    required
  />
  <p>The theme color of the item is shown in the background of the page.</p>
</form>

<style>
  form {
    width: 100%;
  }
</style>
