<script lang="ts">
  import type { ItemId } from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { ItemSection } from '#lib/server/data/item/section.ts';
  import Package from '#lib/components/sections/Package.svelte';
  import Site from '#lib/components/sections/Site.svelte';
  import Feed from '#lib/components/sections/Feed.svelte';
  import Repo from '#lib/components/sections/Repo.svelte';
  import Heading from '#lib/components/sections/Heading.svelte';
  import Links from '#lib/components/sections/Links.svelte';
  import Backlinks from '#lib/components/sections/Backlinks.svelte';
  import Download from '#lib/components/sections/Download.svelte';
  import { unreachable } from '#lib/util.ts';

  type Props = {
    item: ItemId,
    section: ItemSection,
    portfolio: ItemData,
  };

  const { item, section, portfolio }: Props = $props();
</script>

<div class="section-outer">
  <div class="section-inner">
    {#if section.type === 'package'}
      <Package {section} link />
    {:else if section.type === 'site'}
      <Site {section} link />
    {:else if section.type === 'feed'}
      <Feed {section} {item} />
    {:else if section.type === 'repo'}
      <Repo {section} />
    {:else if section.type === 'heading'}
      <Heading {section} />
    {:else if section.type === 'links'}
      <Links {section} {portfolio} link />
    {:else if section.type === 'backlinks'}
      <Backlinks {section} {portfolio} {item} link />
    {:else if section.type === 'download'}
      <Download {section} {item} link />
    {:else}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {@const _ = unreachable(section)}
    {/if}
  </div>
</div>

<style>
  .section-outer {
    display: flex;
    align-items: center;

    gap: 10px;
    width: 100%;
  }

  .section-inner {
    width: 100%;
  }
</style>
