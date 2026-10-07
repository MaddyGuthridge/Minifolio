<script lang="ts">
  import { goto } from '$app/navigation';
  import { Navbar } from '$components';
  import Background from '$components/Background.svelte';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import type { ItemInfo } from '$lib/server/data/item';
  import { reportError } from '$lib/ui/toast';
  import { unreachable } from '$lib/util';
  import ItemFilesEdit from './ItemFilesEdit.svelte';
  import Metadata from './Metadata.svelte';
  type Props = {
    data: import('./$types').PageData,
  };

  const { data = $bindable() }: Props = $props();

  // https://www.reddit.com/r/sveltejs/comments/1gx65ho/comment/lykrc6c/
  let thisItem = $derived.by(() => {
    const thisItem = $state(data.item);
    return thisItem;
  });

  const editorTabs = [
    'Metadata',
    'SEO',
    'Body',
    'Sections',
    'Children',
  ] as const;

  let currentTab: (typeof editorTabs)[number] = $state('Metadata');

  const infoUpdater = new DelayedUpdater(async (info: ItemInfo) => {
    await reportError(
      () => api().item(data.itemId).info.put(info),
      'Error updating item data',
    );
  }, consts.EDIT_COMMIT_HESITATION);
</script>

<Navbar
  path={data.itemId}
  lastItem={thisItem}
  data={data.portfolio}
  loggedIn={true}
  editable
  editing
  onEditFinish={() => {
    infoUpdater.commit();
    void goto(data.itemId);
  }}
/>

<Background color={thisItem.info.color} />

<div class="center" style:--color={thisItem.info.color}>
  <div class="tabs">
    {#each editorTabs as tab (tab)}
      <button
        role="tab"
        class={['tab', { selected: tab === currentTab }]}
        onclick={() => (currentTab = tab)}
      >{tab}</button>
    {/each}
  </div>
  <div class="view">
    {#if currentTab === 'Metadata'}
      <Metadata bind:item={thisItem} itemId={data.itemId} onchange={() => {}} />
      <ItemFilesEdit itemId={data.itemId} bind:files={thisItem.ls} />
    {:else if currentTab === 'SEO'}
      <h1>SEO</h1>
    {:else if currentTab === 'Body'}
      <h1>Body</h1>
    {:else if currentTab === 'Sections'}
      <h1>Sections</h1>
    {:else if currentTab === 'Children'}
      <h1>Children</h1>
    {:else}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {@const _ = unreachable(currentTab)}
    {/if}
  </div>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  .tabs {
    display: flex;
    gap: 20px;
  }
  .tab {
    all: unset;
    cursor: pointer;
    font-size: 1.4rem;
  }
  .tab.selected {
    color: var(--color);
    font-weight: bold;
  }

  .view {
    width: min(90%, 1000px);
  }
</style>
