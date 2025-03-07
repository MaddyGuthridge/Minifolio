<script lang="ts">
  import api from '$endpoints';
  import type { ItemId } from '$lib/itemId';
  import { CallbackSubscription } from '$lib/observer';
  import { itemFileUrl } from '$lib/urls';
  import HtmlReadme from './HtmlReadme.svelte';
  import MarkdownReadme from './MarkdownReadme.svelte';

  type Props = {
    item: ItemId;
    filename: string | null;
    contents: string | null;
    editing: boolean;
    onsubmit: () => void;
  };

  const { item, filename, contents, editing, onsubmit }: Props = $props();

  /** Contents displayed -- updated in $effect */
  let displayContents = $state(contents ?? '');
</script>

{#if filename !== null}
  <!-- Subscribe to data -->
  <CallbackSubscription
    url={itemFileUrl(item, filename)}
    reloadFn={() => api().item(item).file(filename).get().text()}
    bind:value={displayContents}
  />

  {#if filename.endsWith('.md')}
    <MarkdownReadme
      {item}
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
