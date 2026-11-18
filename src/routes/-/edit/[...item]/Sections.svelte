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
  import { dragAndDrop, drop } from '#lib/ui/dnd.svelte.ts';
  import { flip } from 'svelte/animate';

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

  const dndId = 'edit-sections';

  type DndInfo = {
    dndId: string,
    i: number | undefined,
  };

  function handleDrop(draggedIndex: number, info: DndInfo) {
    console.log(draggedIndex, info);
    if (info.dndId !== dndId) {
      // No match, no-op
      return;
    }
    const droppedIndex = info.i;

    const [section] = thisItem.info.sections.splice(draggedIndex, 1);

    if (droppedIndex === undefined) {
      // Not dropped onto an item -> end
      thisItem.info.sections.push(section);
    } else {
      if (draggedIndex > droppedIndex && droppedIndex === 0) {
        thisItem.info.sections.unshift(section);
      } else {
        thisItem.info.sections.splice(droppedIndex, 0, section);
      }
    }
  }
</script>

<h1>Sections</h1>
<div
  class="sections"
  use:drop={{
    canDrop: e => e.source.data.dndId === dndId,
    getData: () => ({ dndId, i: undefined }),
    onDrop: e => handleDrop(
      e.source.data.i as number,
      e.location.current.dropTargets[0].data as DndInfo,
    ),
  }}
>
  <!-- Need to use this yucky key or the animation breaks -->
  {#each thisItem.info.sections as _section, i (JSON.stringify(_section))}
    <div
      class="section-outer"
      animate:flip={{ duration: 300 }}
    >
      <div
        class="section"
        use:dragAndDrop={{
          drag: {
            canDrag: () => true,
            getInitialData: () => ({ dndId, i }),
          },
          drop: {
            canDrop: e => e.source.data.dndId === dndId,
            getData: () => ({ dndId, i }),
          },
        }}
      >
        <div class="section-controls">
          <Button hint="Delete section" onclick={() => deleteSection(i)} mode="warning">
            <div class="btn">
              <i class="las la-trash"></i>
            </div>
          </Button>
          <Button hint="Move section" onclick={() => deleteSection(i)} mode="default">
            <div class="btn">
              <i class="las la-grip-lines"></i>
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
    </div>
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

  .section-outer {
    width: 100%;
  }

  .section-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
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

  .btn {
    width: 30px;
    height: 30px;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
