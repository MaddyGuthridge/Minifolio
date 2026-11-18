<script lang="ts">
  import { Navbar } from '#lib/components/index.ts';
  import Background from '#lib/components/Background.svelte';
  import DataImage from '#lib/components/base/DataImage.svelte';
  import { ItemCardGrid } from '#lib/components/card/index.ts';
  import ItemChipList from '#lib/components/chip/ItemChipList.svelte';
  import Favicon from '#lib/components/Favicon.svelte';
  import consts from '#lib/consts.ts';
  import { getItemAuthor } from '#lib/itemData.ts';
  import { applyFiltersToItemChildren, createItemFilter } from '#lib/itemFilter.ts';
  import itemId from '#lib/itemId.ts';
  import { generateKeywords, getDescription } from '#lib/seo.ts';
  import { itemFileUrl, itemAtomUrl } from '#lib/urls.ts';
  import Readme from './readme';
  import Section from './Section.svelte';
  import { goto } from '$app/navigation';

  type Props = {
    data: import('./$types').PageData,
  };

  const { data }: Props = $props();

  const isRootItem = $derived(data.itemId === '/');

  const thisItem = $derived(data.item);

  let filterItems = $derived(createItemFilter(data.portfolio, data.itemId));

  const displayedItems = $derived.by(() => {
    const items = thisItem.info.children.map(id =>
      itemId.child(data.itemId, id),
    );
    return applyFiltersToItemChildren(data.portfolio, items, filterItems);
  });

  const authorInfo = $derived(getItemAuthor(data.itemId, data.portfolio));

  // Page title
  const pageTitle = $derived(
    isRootItem
      ? data.portfolio.info.name
      : `${thisItem.info.name} - ${data.portfolio.info.name}`,
  );

  // SEO description -- fix the yucky workaround later
  const seoDescription = $derived(getDescription(data.portfolio, data.itemId));

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
  <!-- Site name: name of root item -->
  <meta name="og:site_name" content={data.portfolio.info.name} />

  {#if authorInfo}
    {#if authorInfo.uri}
      <meta name="article:author" content={authorInfo.uri} />
    {/if}
    {#if authorInfo.fediverse}
      <meta name="fediverse:creator" content={authorInfo.fediverse} />
    {/if}
  {/if}

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
  onEditBegin={() => {
    void goto(`/-/edit${data.itemId}`);
  }}
/>

<Background color={thisItem.info.color} />

<div class="center">
  <main>
    <!-- Banner image -->
    {#if thisItem.info.banner}
      <div class="banner-image">
        <DataImage
          url={itemFileUrl(data.itemId, thisItem.info.banner)}
          alt={`Banner of ${thisItem.info.name}`}
        />
      </div>
    {/if}

    <div id="readme">
      <Readme
        item={data.itemId}
        data={data.portfolio}
        article={thisItem.info.article}
        filename={thisItem.info.readme}
        contents={thisItem.readme}
      />
    </div>

    <div id="sections">
      {#each thisItem.info.sections as _section, i (i)}
        <Section
          item={data.itemId}
          portfolio={data.portfolio}
          section={thisItem.info.sections[i]}
        />
      {/each}
    </div>

    <div id="children">
      <!-- Filters -->
      <ItemChipList
        portfolio={data.portfolio}
        items={filterItems}
        onfilter={(newFilter) => {
          filterItems = newFilter;
        }}
      />
      <ItemCardGrid
        portfolio={data.portfolio}
        itemIds={displayedItems}
        editing={false}
      />
    </div>
  </main>

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

  #readme {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #sections {
    width: 100%;
  }
  #children {
    width: 100%;
    margin-bottom: 30px;
  }
</style>
