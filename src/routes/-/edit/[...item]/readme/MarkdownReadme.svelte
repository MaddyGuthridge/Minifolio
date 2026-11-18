<script lang="ts">
  import AuthorText from '#lib/components/AuthorText.svelte';
  import MarkdownEditor from '#lib/components/markdown/MarkdownEditor.svelte';
  import api from '#lib/endpoints/index.ts';
  import { payload } from '#lib/endpoints/fetch/index.ts';
  import { getDescendant, getItemAuthor } from '#lib/itemData.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import { unixToPrettyDate } from '#lib/util.ts';

  type Props = {
    item: ItemId,
    data: ItemData,
    article: boolean,
    setArticle: (value: boolean) => void,
    filename: string,
    contents: string,
    onsubmit: () => void,
  };

  const { item, data, article, setArticle, filename, contents, onsubmit }: Props = $props();

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
  <span class="article-mode-checkbox">
    <input
      type="checkbox"
      id="article-mode-checkbox"
      checked={article}
      onchange={() => setArticle(!article)}
    />
    <label for="article-mode-checkbox">Article mode</label>
  </span>
  {#if article}
    <p class="author-info">
      {#if author}
        <AuthorText {author}/> |
      {/if}
      <i>{date}</i> |
      Reading time: {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
    </p>
  {/if}
  <MarkdownEditor
    source={contents}
    {article}
    onchange={commitChanges}
    {onsubmit}
  />
</div>

<style>
  .article-mode-checkbox {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
  }
</style>
