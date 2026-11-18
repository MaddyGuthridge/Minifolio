<script lang="ts">
  import Button from '#lib/components/base/button/Button.svelte';
  import type { ItemData } from '#lib/server/data/item/item.ts';
  import type { ItemId } from '#lib/validate.ts';
  import BacklinksEditor from './sections/BacklinksEditor.svelte';
  import CreateSectionForm from './sections/CreateSectionForm.svelte';
  import DownloadEditor from './sections/DownloadEditor.svelte';
  import FeedEditor from './sections/FeedEditor.svelte';
  import HeadingEditor from './sections/HeadingEditor.svelte';
  import LinksEditor from './sections/LinksEditor.svelte';
  import PackageEditor from './sections/PackageEditor.svelte';
  import RepoEditor from './sections/RepoEditor.svelte';
  import SiteEditor from './sections/SiteEditor.svelte';

  type Props = {
    item: ItemId,
    portfolio: ItemData,
    thisItem: ItemData,
    onchange: () => void,
  };

  const { item, portfolio, thisItem = $bindable(), onchange }: Props = $props();

  function deleteSection(i: number) {
    thisItem.info.sections.splice(i, 1);
    onchange();
  }
</script>

<div class="sections">
  {#each thisItem.info.sections as _section, i (i)}
    <div class="section">
      <div class="section-controls">
        <Button hint="Delete section" onclick={() => deleteSection(i)} mode="warning">
          <div class="delete-button">
            <i class="las la-trash"></i>
          </div>
        </Button>
      </div>
      <span class="grow"></span>
      <div class="section-inner">
        {#if thisItem.info.sections[i].type === 'package'}
          <PackageEditor bind:section={thisItem.info.sections[i]} {onchange} />
        {:else if thisItem.info.sections[i].type === 'site'}
          <SiteEditor bind:section={thisItem.info.sections[i]} {onchange} />
        {:else if thisItem.info.sections[i].type === 'feed'}
          <FeedEditor bind:section={thisItem.info.sections[i]} {item} {onchange} />
        {:else if thisItem.info.sections[i].type === 'repo'}
          <RepoEditor bind:section={thisItem.info.sections[i]} {onchange} />
        {:else if thisItem.info.sections[i].type === 'heading'}
          <HeadingEditor bind:section={thisItem.info.sections[i]} {onchange} />
        {:else if thisItem.info.sections[i].type === 'links'}
          <LinksEditor bind:section={thisItem.info.sections[i]} {portfolio} {onchange} />
        {:else if thisItem.info.sections[i].type === 'backlinks'}
          <BacklinksEditor bind:section={thisItem.info.sections[i]} {portfolio} {item} {onchange} />
        {:else if thisItem.info.sections[i].type === 'download'}
          <DownloadEditor bind:section={thisItem.info.sections[i]} {portfolio} {item} {onchange} />
        {/if}
      </div>
    </div>
    <hr />
  {/each}

  <CreateSectionForm
    oncreate={(newSection) => {
      thisItem.info.sections.push(newSection);
      // Creating items should commit changes immediately
      onchange();
    }}
  />
</div>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .section {
    display: flex;
    gap: 10px;
    width: 100%;
  }
  hr {
    width: 80%;
  }
  .section-inner {
    width: 100%;
  }

  .grow {
    flex-grow: 1;
  }

  .delete-button {
    width: 50px;
    height: 50px;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
