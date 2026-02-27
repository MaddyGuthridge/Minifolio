<script lang="ts">
  import { onMount } from 'svelte';
  import Markdown from './Markdown.svelte';
  import MarkdownEditor from './MarkdownEditor.svelte';

  type Props = {
    /** Markdown source code */
    source: string,
    /** Whether we are currently editing the markdown */
    editing: boolean,
    /** Called when the user uses the submit shortcut (ie "Ctrl+Enter") */
    onsubmit: () => void,
    /** Called when content changes */
    onchange: (text: string) => Promise<void>,
    /** Whether to display the Markdown as an article */
    article?: boolean,
    setArticle: (value: boolean) => void,
  };

  let { source = $bindable(), editing, onsubmit, onchange, article = false, setArticle }: Props = $props();

  // Horrific hack to force abcjs to render properly: we force-rerender the markdown
  // by changing the source slightly.
  // FIXME: There has got to be a better way to do this.
  onMount(() => {
    source = source + '\n';
  });
</script>

{#if editing}
  <MarkdownEditor bind:source {article} {setArticle} {onsubmit} {onchange} />
{:else}
  <Markdown {source} {article} />
{/if}
