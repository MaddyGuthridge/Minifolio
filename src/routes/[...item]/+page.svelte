<script lang="ts">
  import { Navbar } from '$components';
  import Background from '$components/Background.svelte';
  import { ItemCardGrid } from '$components/card';
  import EditControls from '$components/EditControls.svelte';
  import EditableMarkdown from '$components/markdown';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import { generateKeywords } from '$lib/seo';
  import ItemFilesEdit from './ItemFilesEdit.svelte';
  import MainDataEdit from './ItemInfoEdit.svelte';
  import Section from './sections';

  type Props = {
    data: import('./$types').PageData;
  };

  let { data = $bindable() }: Props = $props();

  let thisItem = $state(data.item);

  const isRootItem = $derived(data.itemId.length === 0);

  // Eventually, add editing mode to this
  let editing = $state(false);
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
/>

<Background color={thisItem.info.color} />

<div class="center">
  <main>
    <EditControls
      loggedIn={data.loggedIn}
      {editing}
      onbegin={() => (editing = true)}
      onfinish={() => (editing = false)}
    />
    {#if editing}
      <MainDataEdit
        itemId={data.itemId}
        bind:itemInfo={thisItem.info}
        onchange={async (info) => {
          await api().item(data.itemId).info.put(info);
        }}
      />

      <ItemFilesEdit itemId={data.itemId} bind:files={thisItem.ls} />
    {/if}

    <div id="readme">
      <div id="info-container">
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
      {#each data.item.info.sections as section}
        <Section portfolio={data.portfolio} {section} {editing} />
      {/each}
    </div>

    <div id="children">
      <ItemCardGrid
        portfolio={data.portfolio}
        itemIds={data.item.info.children.map((id) => [...data.itemId, id])}
        onclick={() => {}}
        {editing}
      />
    </div>
  </main>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%;
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
</style>
