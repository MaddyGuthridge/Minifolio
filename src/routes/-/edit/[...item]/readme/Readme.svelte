<script lang="ts">
  import FilePicker from '#lib/components/pickers/FilePicker.svelte';
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

<h1>Body</h1>
<div class="readme-picker-box">
  <div class="readme-picker-box">
    <label for="readme-picker">Pick a readme file</label>
    <FilePicker
      id="readme-picker"
      files={thisItem.ls}
      bind:selected={thisItem.info.readme}
      {onchange}
    />
  </div>
</div>

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

<style>
  .readme-picker-box {
    margin-bottom: 10px;
  }
</style>
