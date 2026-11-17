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
    onDataChange: (data: ItemData) => void,
    onsubmit: () => void,
  };

  const { item, data, onDataChange, onsubmit }: Props = $props();

  // Contents displayed, updated in $effect
  // Will fix this at some point using callbacks or something. I know it's bad.
  // svelte-ignore state_referenced_locally
  let displayContents = $state(data.readme ?? '');
  const filename = $derived(data.info.readme);
</script>

<div class="readme-picker-box">
  <h2>Readme</h2>
  <div class="readme-picker-box">
    <label for="readme-picker">Pick a readme file</label>
    <FilePicker
      id="readme-picker"
      files={data.ls}
      bind:selected={data.info.readme}
      onchange={() => onDataChange(data)}
    />
  </div>
</div>

{#if filename !== null}
  <!-- Subscribe to data -->
  <CallbackSubscription
    url={itemFileUrl(item, filename)}
    reloadFn={() => api().item(item).file(filename).get().text()}
    originalValue={data.readme}
    bind:value={displayContents}
  />

  {#if filename.endsWith('.md')}
    <MarkdownReadme
      {item}
      {data}
      article={data.info.article}
      setArticle={(value) => { data.info.article = value }}
      {filename}
      contents={displayContents}
      {onsubmit}
    />
  {:else if filename.endsWith('.html')}
    <HtmlReadme contents={displayContents} />
  {:else}
    <div>
      Error rendering: unknown README file type '{filename}'.
    </div>
  {/if}
{/if}
