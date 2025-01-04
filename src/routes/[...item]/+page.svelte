<script lang="ts">
  import { Navbar } from '$components';
  import Background from '$components/Background.svelte';
  import { ItemCardGrid } from '$components/card';
  import EditableMarkdown from '$components/markdown';
  import consts from '$lib/consts';
  import { getDescendant } from '$lib/itemData';
  import { generateKeywords } from '$lib/seo';
  import Section from './sections';

  type Props = {
    data: import('./$types').PageData;
  };

  let { data = $bindable() }: Props = $props();

  const thisItem = $derived(getDescendant(data.portfolio, data.itemId));

  // Eventually, add editing mode to this
  const editing = false;
</script>

<svelte:head>
  <title>{data.portfolio.info.name}</title>
  {#if data.portfolio.info.seo.description}
    <meta name="description" content={data.portfolio.info.seo.description} />
  {/if}
  <meta name="generator" content={consts.APP_NAME} />
  <meta
    name="keywords"
    content={generateKeywords(data.portfolio, data.itemId)}
  />
  <meta name="theme-color" content={thisItem.info.color} />
  {#if data.config.siteIcon}
    <link rel="icon" href={data.config.siteIcon} />
  {/if}
</svelte:head>

<Navbar path={data.itemId} data={data.portfolio} loggedIn={data.loggedIn} />

<Background color={thisItem.info.color} />

<main>
  <div id="readme">
    <div id="info-container">
      <EditableMarkdown
        {editing}
        bind:source={thisItem.readme}
        onsubmit={() => {}}
      />
    </div>
  </div>
  <div id="sections">
    {#each thisItem.info.sections as section}
      <Section {section} />
    {/each}
  </div>

  <div id="children">
    <ItemCardGrid
      portfolio={data.portfolio}
      itemIds={thisItem.info.children.map((id) => [...data.itemId, id])}
      onclick={() => {}}
      {editing}
    />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  #readme {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #info-container {
    padding: 20px;
    width: 90%;
  }
</style>
