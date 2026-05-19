<script lang="ts">
  import api from '$endpoints';
  import type { ItemId } from '$lib/itemId';
  import { CallbackSubscription } from '$lib/observer';
  import type { ItemData } from '$lib/server/data/item';
  import { itemFileUrl } from '$lib/urls';
  import HtmlReadme from './HtmlReadme.svelte';
  import MarkdownReadme from './MarkdownReadme.svelte';

  type Props = {
    item: ItemId,
    data: ItemData,
    article: boolean,
    setArticle: (value: boolean) => void,
    filename: string | null,
    contents: string | null,
    editing: boolean,
    onsubmit: () => void,
  };

  const { item, data, article, setArticle, filename, contents, editing, onsubmit }: Props = $props();

  // Contents displayed, updated in $effect
  // Will fix this at some point using callbacks or something. I know it's bad.
  // svelte-ignore state_referenced_locally
  let displayContents = $state(contents ?? '');
</script>

{#if filename !== null}
  <!-- Subscribe to data -->
  <CallbackSubscription
    url={itemFileUrl(item, filename)}
    reloadFn={() => api().item(item).file(filename).get().text()}
    originalValue={contents}
    bind:value={displayContents}
  />

  {#if filename.endsWith('.md')}
    <MarkdownReadme
      {item}
      {data}
      {article}
      {setArticle}
      {filename}
      contents={displayContents}
      {editing}
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
