<script lang="ts">
  import api from '#lib/endpoints/index.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import { CallbackSubscription } from '#lib/observer/index.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import { itemFileUrl } from '#lib/urls.ts';
  import HtmlReadme from './HtmlReadme.svelte';
  import MarkdownReadme from './MarkdownReadme.svelte';

  type Props = {
    item: ItemId,
    data: ItemData,
    thisItem: ItemData,
    onsubmit: () => void,
    onchange: () => void,
  };

  const { item, data, thisItem = $bindable(), onsubmit, onchange }: Props = $props();
</script>

{#if thisItem.info.readme !== null}
  <!-- Subscribe to data -->
  <CallbackSubscription
    url={itemFileUrl(item, thisItem.info.readme)}
    reloadFn={() => api().item(item).file(thisItem.info.readme!).get().text()}
    originalValue={thisItem.readme}
    bind:value={thisItem.readme}
  />

  {#if thisItem.info.readme.endsWith('.md')}
    <MarkdownReadme
      {item}
      {data}
      article={thisItem.info.article}
      setArticle={(value) => {
        thisItem.info.article = value;
        onchange();
      }}
      filename={thisItem.info.readme}
      contents={thisItem.readme!}
      {onsubmit}
    />
    <!-- Note: actual file contents are persisted inside of this element -->
  {:else if thisItem.info.readme.endsWith('.html')}
    <HtmlReadme contents={data.readme!} />
  {:else}
    <div>
      Error rendering: unknown README file type '{data.info.readme}'.
    </div>
  {/if}
{/if}
