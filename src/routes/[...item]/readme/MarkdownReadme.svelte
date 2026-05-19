<script lang="ts">
  import AuthorText from '$components/AuthorText.svelte';
  import EditableMarkdown from '$components/markdown';
  import api from '$endpoints';
  import { payload } from '$endpoints/fetch';
  import { getDescendant, getItemAuthor } from '$lib/itemData';
  import type { ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';
  import { unixToPrettyDate } from '$lib/util';

  type Props = {
    item: ItemId,
    data: ItemData,
    article: boolean,
    setArticle: (value: boolean) => void,
    filename: string,
    contents: string,
    editing: boolean,
    onsubmit: () => void,
  };

  const { item, data, article, setArticle, filename, contents, editing, onsubmit }: Props = $props();

  async function commitChanges(newText: string) {
    await api().item(item).file(filename).put(payload.text(newText));
  }

  // The average adult reads at 238 words per minute
  // https://www.wordcountertool.net/average-reading-speed-by-age
  const readingTime = $derived(Math.ceil(contents.split(/\s+/).length / 238));

  const author = $derived(getItemAuthor(item, data));
  const date = $derived(unixToPrettyDate(getDescendant(data, item).info.timeCreated));
</script>
<div>
  {#if article && !editing}
    <p>
      {#if author}
        <AuthorText {author}/> |
      {/if}
      <i>{date}</i> |
      Reading time: {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
    </p>
  {/if}
  <EditableMarkdown
    source={contents}
    {article}
    {setArticle}
    {editing}
    onchange={commitChanges}
    {onsubmit}
  />
</div>
