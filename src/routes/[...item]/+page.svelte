<script lang="ts">
  import { Navbar } from '$components';
  import Background from '$components/Background.svelte';
  import { Button } from '$components/base';
  import { ItemCardGrid } from '$components/card';
  import EditableMarkdown from '$components/markdown';
  import { NewItemModal } from '$components/modals';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import { generateKeywords } from '$lib/seo';
  import type { ItemInfo } from '$lib/server/data/item';
  import { itemFileUrl } from '$lib/urls';
  import ItemFilesEdit from './ItemFilesEdit.svelte';
  import MainDataEdit from './ItemInfoEdit.svelte';
  import Section from './sections';
  import CreateSectionForm from './sections/CreateSectionForm.svelte';

  type Props = {
    data: import('./$types').PageData;
  };

  let { data }: Props = $props();

  const isRootItem = $derived(data.itemId.length === 0);

  let editing = $state(false);

  let newItemModalShown = $state(false);

  let thisItem = $state(data.item);
  // Janky workaround for allowing PageData to be bindable.
  // Based on https://www.reddit.com/r/sveltejs/comments/1gx65ho/comment/lykrc6c/
  $effect.pre(() => {
    thisItem = data.item;
    // When item data changes, also disable editing
    editing = false;
  });

  let infoUpdater = new DelayedUpdater(async (info: ItemInfo) => {
    await api().item(data.itemId).info.put(info);
  }, consts.EDIT_COMMIT_HESITATION);
</script>

<svelte:head>
  {#if isRootItem}
    <title>{data.portfolio.info.name}</title>
  {:else}
    <title>{thisItem.info.name} - {data.portfolio.info.name}</title>
  {/if}
  {#if data.portfolio.info.seo.description}
    <meta name="description" content={data.portfolio.info.seo.description} />
  {/if}
  <meta name="generator" content={consts.APP_NAME} />
  <meta
    name="keywords"
    content={generateKeywords(data.portfolio, data.itemId)}
  />
  <meta name="theme-color" content={data.item.info.color} />
  {#if data.config.siteIcon}
    <link rel="icon" href={data.config.siteIcon} />
  {/if}
</svelte:head>

<Navbar
  path={data.itemId}
  lastItem={thisItem}
  data={data.portfolio}
  loggedIn={data.loggedIn}
  editable={data.loggedIn}
  {editing}
  onEditBegin={() => (editing = true)}
  onEditFinish={() => {
    editing = false;
    infoUpdater.commit();
  }}
/>

<Background color={thisItem.info.color} />

<div class="center">
  <main>
    {#if editing}
      <MainDataEdit
        itemId={data.itemId}
        bind:item={thisItem}
        onchange={(newInfo) => infoUpdater.update(newInfo)}
      />

      <ItemFilesEdit itemId={data.itemId} bind:files={thisItem.ls} />
    {:else}
      <!-- Banner image -->
      {#if thisItem.info.banner}
        <img
          src={itemFileUrl(data.itemId, thisItem.info.banner)}
          alt={`Banner of ${thisItem.info.name}`}
          class="banner-image"
        />
      {/if}
    {/if}

    <div id="readme">
      <div id="info-container">
        {#if editing}
          <h2>README.md</h2>
        {/if}
        <EditableMarkdown
          {editing}
          bind:source={thisItem.readme}
          onsubmit={() => (editing = false)}
          onchange={async (text) => {
            await api().item(data.itemId).readme.put(text);
          }}
        />
      </div>
    </div>
    <div id="sections">
      {#if editing}
        <h2>Sections</h2>
      {/if}
      {#each thisItem.info.sections as _section, i}
        <Section
          portfolio={data.portfolio}
          bind:section={thisItem.info.sections[i]}
          {editing}
          onchange={() => infoUpdater.update(thisItem.info)}
          ondelete={() => {
            thisItem.info.sections.splice(i, 1);
            // Deleting items should commit changes immediately
            infoUpdater.immediateUpdate(thisItem.info);
          }}
        />
      {/each}
    </div>

    {#if editing}
      <CreateSectionForm
        oncreate={(newSection) => {
          thisItem.info.sections.push(newSection);
          // Creating items should commit changes immediately
          infoUpdater.immediateUpdate(thisItem.info);
        }}
      />
    {/if}

    <div id="children">
      {#if editing}
        <h2>Children</h2>
      {/if}
      <ItemCardGrid
        portfolio={data.portfolio}
        itemIds={thisItem.info.children.map((id) => [...data.itemId, id])}
        onclick={() => {}}
        {editing}
      />
    </div>
    {#if editing}
      <Button onclick={() => (newItemModalShown = true)}>
        Create child item
      </Button>
    {/if}
  </main>

  <NewItemModal
    show={newItemModalShown}
    parent={data.itemId}
    onclose={() => (newItemModalShown = false)}
  />
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1000px;
    width: 90%;
  }

  .banner-image {
    width: 100%;
    max-height: 30vh;
    border-radius: 10px;
  }

  #readme {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #info-container {
    padding: 20px;
    width: 100%;
  }
  #sections {
    width: 100%;
  }
</style>
