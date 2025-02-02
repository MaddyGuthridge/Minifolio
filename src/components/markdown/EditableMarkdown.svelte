<script lang="ts">
  import Markdown from './Markdown.svelte';
  import MarkdownEditor from './MarkdownEditor.svelte';

  type Props = {
    /** Markdown source code */
    source: string;
    /** Whether we are currently editing the markdown */
    editing: boolean;
    /** Called when the user uses the submit shortcut (ie "Ctrl+Enter") */
    onsubmit: () => void;
    /** Called when content changes */
    onchange: (text: string) => Promise<void>;
  };

  let { source = $bindable(), editing, onsubmit, onchange }: Props = $props();
</script>

{#if editing}
  <MarkdownEditor bind:source {onsubmit} {onchange} />
{:else}
  <Markdown {source} />
{/if}
