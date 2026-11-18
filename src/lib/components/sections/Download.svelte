<script lang="ts">
  import type { ItemId } from '#lib/itemId.ts';
  import type { DownloadSection } from '#lib/server/data/item/section.ts';
  import { itemFileUrl } from '#lib/urls.ts';

  type Props = {
    item: ItemId,
    section: DownloadSection,
    link: boolean,
  };

  const { item, section, link }: Props = $props();
</script>

<div class="section-main">
  {#if link}
    <a href={itemFileUrl(item, section.file)} download class="display-outer">
      <i class="icon las la-download"></i>
      <div>
        <h3>{section.label ?? 'Download'}</h3>
        <p><b><u>{section.file}</u></b></p>
      </div>
    </a>
  {:else}
    <div class="display-outer">
      <i class="icon las la-download"></i>
      <div>
        <h3>{section.label ?? 'Download'}</h3>
        <p><b><u>{section.file}</u></b></p>
      </div>
    </div>
  {/if}
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  h3,
  p {
    margin: 0;
  }

  .display-outer {
    text-decoration: none;
    color: black;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .icon {
    font-size: 5rem;
  }

  @media (prefers-color-scheme: dark) {
    .display-outer {
      color: white;
    }
  }
</style>
