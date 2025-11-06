<script lang="ts">
  import { Navbar } from '$components';
  import Background from '$components/Background.svelte';
  import { Button } from '$components/base';
  import DataImage from '$components/base/DataImage.svelte';
  import { ItemCardGrid } from '$components/card';
  import ItemChipList from '$components/chip/ItemChipList.svelte';
  import Favicon from '$components/Favicon.svelte';
  import { NewItemModal } from '$components/modals';
  import { FilePicker } from '$components/pickers';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import { applyFiltersToItemChildren, createItemFilter } from '$lib/itemFilter';
  import itemId from '$lib/itemId';
  import { generateKeywords, getDescription } from '$lib/seo';
  import type { ItemInfo } from '$lib/server/data/item';
  import { reportError } from '$lib/ui/toast';
  import { itemFileUrl, itemAtomUrl } from '$lib/urls';
  import ItemFilesEdit from './ItemFilesEdit.svelte';
  import MainDataEdit from './ItemInfoEdit.svelte';
  import Readme from './readme';
  import Section from './sections';
  import CreateSectionForm from './sections/CreateSectionForm.svelte';

  type Props = {
    data: import('./$types').PageData,
  };

  const { data }: Props = $props();

  const isRootItem = $derived(data.itemId === '/');

  let editing = $state(false);

  let newItemModalShown = $state(false);

  const infoUpdater = new DelayedUpdater(async (info: ItemInfo) => {
    await reportError(
      () => api().item(data.itemId).info.put(info),
      'Error updating item data',
    );
  }, consts.EDIT_COMMIT_HESITATION);

  let thisItem = $state(data.item);

  let filterItems = $state(createItemFilter(data.portfolio, data.itemId));

  const displayedItems = $derived.by(() => {
    const items = thisItem.info.children.map(id =>
      itemId.child(data.itemId, id),
    );
    if (editing) {
      return items;
    } else {
      return applyFiltersToItemChildren(data.portfolio, items, filterItems);
    }
  });

  // Janky workaround for allowing PageData to be bindable.
  // Based on https://www.reddit.com/r/sveltejs/comments/1gx65ho/comment/lykrc6c/
  $effect.pre(() => {
    thisItem = data.item;
    // When item data changes, also disable editing
    editing = false;
    // Reset the filter items
    filterItems = createItemFilter(data.portfolio, data.itemId);
  });

  // Page title
  const pageTitle = $derived(
    isRootItem
      ? data.portfolio.info.name
      : `${thisItem.info.name} - ${data.portfolio.info.name}`,
  );
  // SEO description
  const seoDescription = getDescription(data.portfolio, data.itemId);
  // Open graph content type
  const ogType = $derived(
    thisItem.info.article
      ? 'article'
      : 'website',
  );
</script>

<svelte:head>
  <!-- Title -->
  <title>{pageTitle}</title>

  <!-- SEO -->
  {#if seoDescription}
    <meta name="description" content={seoDescription} />
  {/if}
  <meta
    name="keywords"
    content={generateKeywords(data.portfolio, data.itemId)}
  />

  <!--
    Social (open graph)
    https://ogp.me/
  -->
  <meta name="og:title" content={pageTitle} />
  <meta name="og:description" content={seoDescription} />
  <meta name="og:type" content={ogType} />
  <!--
    Adding author info for articles requires accessing data of all parent items, which is possible
    using the given data in `data.portfolio` but I really cannot be bothered to implement that
    at the moment.
  -->

  <!-- Site icon -->
  {#if data.config.siteIcon}
    <meta property="og:image" content={itemFileUrl(itemId.ROOT, data.config.siteIcon)} />
  {:else}
    <meta property="og:image" content={consts.APP_ICON_URL} />
  {/if}

  <!-- Theming -->
  <meta name="theme-color" content={data.item.info.color} />
  <Favicon path={data.config.siteIcon ?? undefined} />

  <!-- List Minifolio as generator -->
  <meta name="generator" content={consts.APP_NAME} />

  <!-- Site verification: rel="me" -->
  {#each data.config.verification.relMe as me (me)}
    <link rel="me" href={me} />
  {/each}
  <!-- Site verification: Google and Bing -->
  {#if data.config.verification.google}
    <meta
      name={consts.VERIFICATION_TAGS.google}
      content={data.config.verification.google}
    />
  {/if}
  {#if data.config.verification.bing}
    <meta
      name={consts.VERIFICATION_TAGS.bing}
      content={data.config.verification.bing}
    />
  {/if}

  <!-- Feeds -->
  {#if thisItem.info.feed}
    <!-- RSS -->
    {#if thisItem.info.feed.providers.atom}
      <link
        rel="alternate"
        type={consts.MIME_TYPES.ATOM}
        title={thisItem.info.name}
        href={itemAtomUrl(data.itemId)}
      />
    {/if}
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
        onchange={(newInfo) => {
          thisItem.info = newInfo;
          infoUpdater.update(newInfo);
        }}
      />

      <ItemFilesEdit itemId={data.itemId} bind:files={thisItem.ls} />
    {:else}
      <!-- Banner image -->
      {#if thisItem.info.banner}
        <div class="banner-image">
          <DataImage
            url={itemFileUrl(data.itemId, thisItem.info.banner)}
            alt={`Banner of ${thisItem.info.name}`}
          />
        </div>
      {/if}
    {/if}

    <div id="readme">
      {#if editing}
        <div class="readme-picker-box">
          <h2>Readme</h2>
          <div class="readme-picker-box">
            <label for="readme-picker">Pick a readme file</label>
            <FilePicker
              id="readme-picker"
              files={thisItem.ls}
              bind:selected={thisItem.info.readme}
              onchange={() => infoUpdater.update(thisItem.info)}
            />
          </div>
        </div>
      {/if}
      <Readme
        item={data.itemId}
        article={thisItem.info.article}
        setArticle={(value) => {
          console.log('Article:', value);
          thisItem.info.article = value;
          infoUpdater.update(thisItem.info);
        }}
        filename={thisItem.info.readme}
        contents={thisItem.readme}
        {editing}
        onsubmit={() => {
          infoUpdater.commit();
          editing = false;
        }}
      />
    </div>

    <div id="sections">
      {#if editing}
        <h2>Sections</h2>
      {/if}
      {#each thisItem.info.sections as _section, i (i)}
        <Section
          item={data.itemId}
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
      {:else}
        <!-- Filters -->
        <ItemChipList
          portfolio={data.portfolio}
          items={filterItems}
          onfilter={(newFilter) => {
            filterItems = newFilter;
          }}
        />
      {/if}
      <ItemCardGrid
        portfolio={data.portfolio}
        itemIds={displayedItems}
        {editing}
        dndId={`${data.itemId}:children`}
        onReorder={(items) => {
          thisItem.info.children = items.map(id => itemId.suffix(id));
          infoUpdater.update(thisItem.info);
        }}
      />
      {#if editing}
        <h3>Hidden children</h3>
        {@const hiddenChildren = Object.keys(thisItem.children).filter(
          child => !thisItem.info.children.includes(child),
        )}
        <ItemCardGrid
          portfolio={data.portfolio}
          itemIds={hiddenChildren.map(id => itemId.child(data.itemId, id))}
          {editing}
          dndId={`${data.itemId}:children`}
          onDropItem={(droppedItemId) => {
            // When an item is dropped here, remove it from the list of shown children
            const tail = itemId.suffix(droppedItemId);
            thisItem.info.children = thisItem.info.children.filter(
              id => id !== tail,
            );
            infoUpdater.update(thisItem.info);
          }}
        />
      {/if}
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
    border-radius: 10px;
    overflow: hidden;
  }

  .readme-picker-box {
    margin-bottom: 10px;
  }

  #readme {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .readme-picker-box {
    width: 100%;
  }

  #sections {
    width: 100%;
  }
  #children {
    width: 100%;
    margin-bottom: 30px;
  }
</style>
