<script lang="ts">
  import type { ItemId } from '$lib/itemId';
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
</script>

{#if filename === null}
  <!-- Empty, as there is no readme -->
{:else if filename.endsWith('.md')}
  <MarkdownReadme {item} {filename} contents={contents!} {editing} {onsubmit} />
{:else if filename.endsWith('.html')}
  <HtmlReadme contents={contents!} />
{:else}
  <div>
    Error rendering: unknown README file type {filename}
  </div>
{/if}
