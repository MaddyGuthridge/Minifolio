<script lang="ts">
  import { Navbar } from '$components';
  import { IconCard, RepoCard, PackageCard, CardList, ItemCardGrid } from '$components/card';
  import { ItemChipList } from '$components/chip';
  import Background from '$components/Background.svelte';
  import Paper from '$components/Paper.svelte';
  import EditableMarkdown from '$components/markdown';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import { generateKeywords } from '$lib/seo';
  import EditControls from '$components/EditControls.svelte';
  // import AsciinemaPlayer from "$components";

  export let data: import('./$types').PageData;

  let groupData = data.globals.groups[data.groupId];
  let itemData = data.globals.items[data.groupId][data.itemId];

  let editing = false;

  let readme = '';

  let chipLinks = itemData.info.links.filter(([l]) => l.style === 'chip');
  let cardLinks = itemData.info.links.filter(([l]) => l.style === 'card');

  function beginEditing() {
    editing = true;
  }

  async function finishEditing(save: boolean) {
    editing = false;
    if (save) {
      itemData.readme = readme;
      await api().group.withId(data.groupId).item.withId(data.itemId).readme.set(readme);
      // Update other info
      await api().group.withId(data.groupId).item.withId(data.itemId).info.set(itemData.info);
    }
    // Reset data
    setupData(data.groupId, data.itemId);
  }

  function setupData(groupId: string, itemId: string) {
    editing = false;
    groupData = data.globals.groups[groupId];
    itemData = data.globals.items[groupId][itemId];
    readme = itemData.readme;
    chipLinks = itemData.info.links.filter(([l]) => l.style === 'chip');
    cardLinks = itemData.info.links.filter(([l]) => l.style === 'card');
  }

  function changeLinkTitle(linkedGroup: string, newTitle: string) {
    const linkInfo = itemData.info.links.find(link => link[0].groupId === linkedGroup);
    if (!linkInfo) {
      // This shouldn't happen
      throw Error(`changeLinkTitle: linkInfo not found for ${linkedGroup}`);
    }
    linkInfo[0].title = newTitle;
  }

  async function toggleLink(linkedGroup: string, linkedItem: string) {
    const linkInfo = itemData.info.links.find(link => link[0].groupId === linkedGroup);
    if (!linkInfo) {
      // This shouldn't happen
      throw Error(`toggleLink: linkInfo not found for ${linkedGroup}/${linkedItem}`);
    }
    const newState = !linkInfo[1].includes(linkedItem);
    if (newState) {
      // Create link
      await api().group.withId(data.groupId).item.withId(data.itemId).links.create(linkedGroup, linkedItem);
      // Update state in browser to match
      linkInfo[1].push(linkedItem);
    } else {
      // Unlink
      await api().group.withId(data.groupId).item.withId(data.itemId).links.remove(linkedGroup, linkedItem);
      linkInfo[1] = linkInfo[1].filter(item => item !== linkedItem);
    }
    // Force update chip and card links
    chipLinks = [...chipLinks];
    cardLinks = [...cardLinks];
  }

  $: setupData(data.groupId, data.itemId);
</script>

<!-- TODO: Find a less repetitive way to get SEO working nicely -->
<svelte:head>
  <title>{itemData.info.name} - {groupData.info.name} - {data.globals.config.siteShortName}</title>
  <meta name="description" content="{itemData.info.pageDescription}">
  <meta name="generator" content="{consts.APP_NAME}">
  <meta name="keywords" content="{generateKeywords(data.globals, data.groupId, data.itemId)}">
  <meta name="theme-color" content="{itemData.info.color}">
</svelte:head>

<Background color={itemData.info.color}></Background>

<Navbar
  path={[
    { url: data.groupId, txt: groupData.info.name },
    { url: data.itemId, txt: itemData.info.name },
  ]}
  config={data.globals.config}
  loggedIn={data.loggedIn}
/>

<main>
  <EditControls {editing} on:beginEdits={beginEditing} on:finishEdits={e => finishEditing(e.detail)}/>
  {#if itemData.info.banner}
    <img
      src="/{data.groupId}/{data.itemId}/{itemData.info.banner}"
      alt="Banner for {itemData.info.name}"
      class="banner-image"
    />
  {/if}
  <div id="info-container">
    <EditableMarkdown
      source={readme}
      {editing}
    />
    <!-- Display linked items as chips -->
    <div id="chip-links">
      {#each chipLinks as [linkOptions, linkedItems]}
      {#if !editing}
          <div class="chip-link-row">
            <h2>{linkOptions.title}</h2>
            <ItemChipList
              globals={data.globals}
              items={[linkedItems.map(i => ({ groupId: linkOptions.groupId, itemId: i, selected: false }))]}
              link={true}
            />
          </div>
        {:else}
          <div class="chip-link-row">
            <input type="text" bind:value={linkOptions.title} on:input={() => changeLinkTitle(linkOptions.groupId, linkOptions.title)} />
            <div class="chip-link-items">
              <ItemChipList
                globals={data.globals}
                items={[Object.keys(data.globals.items[linkOptions.groupId]).map(itemId => ({ groupId: linkOptions.groupId, itemId, selected: linkedItems.includes(itemId) }))]}
                on:click={e => toggleLink(e.detail.groupId, e.detail.itemId)}
              />
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Display URLs if needed -->
  <div id="urls-list">
    <CardList>
      {#if itemData.info.urls.site}
        <IconCard
          title="Visit the website"
          link={itemData.info.urls.site}
          color={itemData.info.color}
        >
        <i slot="icon" class="las la-globe"></i>
        </IconCard>
      {/if}
      {#if itemData.info.urls.docs}
        <IconCard
          title="View the documentation"
          link={itemData.info.urls.docs}
          color={itemData.info.color}
        >
          <i slot="icon" class="lab la-readme"></i>
        </IconCard>
      {/if}
      {#if itemData.info.urls.repo}
        <RepoCard
          repo={itemData.info.urls.repo}
          color={itemData.info.color}
        />
      {/if}
      {#if itemData.info.package}
        <PackageCard
          info={itemData.info.package}
          color={itemData.info.color}
        />
      {/if}
    </CardList>
  </div>

  <!--
      Asciinema seems to be broken currently:
      https://github.com/asciinema/asciinema-player/issues/259
  -->
  <!-- {#if label.hasDemo}
    <AsciinemaPlayer castUrl="/projects/{label.slug}/demo.asciinema" />
  {/if} -->

  <!-- Display linked items as cards -->
  <div id="card-links">
    {#each cardLinks as [linkOptions, linkedItems]}
    <h2 contenteditable={editing}>
      {linkOptions.title}
    </h2>
      <ItemCardGrid
        globals={data.globals}
        groupId={linkOptions.groupId}
        itemIds={linkedItems}
        editing={false}
      />
    {/each}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #info-container {
    padding: 20px;
    margin: 10px;
    width: 99%;
  }

  .banner-image {
    max-width: 80%;
    max-height: 30%;
    border-radius: 10px;
  }

  #chip-links {
    width: 100%;
  }
  .chip-link-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin: 10px 0;
    width: 100%;
  }
  .chip-link-row > h2 {
    margin: 0;
    height: min-content;
  }
  .chip-link-items {
    overflow-x: scroll;
  }

  #urls-list {
    width: 100%;
  }

  #card-links {
    width: 100%;
  }
  #card-links > h2 {
    margin: 20px;
  }
</style>
