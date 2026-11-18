<script lang="ts">
  import AuthorText from '#lib/components/AuthorText.svelte';
  import { getDescendant, getItemAuthor } from '#lib/itemData.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import { unixToPrettyDate } from '#lib/util.ts';
  import Markdown from '#lib/components/markdown/Markdown.svelte';

  type Props = {
    item: ItemId,
    data: ItemData,
    article: boolean,
    contents: string,
  };

  const { item, data, article, contents }: Props = $props();

  // The average adult reads at 238 words per minute
  // https://www.wordcountertool.net/average-reading-speed-by-age
  const readingTime = $derived(Math.ceil(contents.split(/\s+/).length / 238));

  const author = $derived(getItemAuthor(item, data));
  const date = $derived(unixToPrettyDate(getDescendant(data, item).info.timeCreated));
</script>

<div>
  {#if article}
    <p class="author-info">
      {#if author}
        <AuthorText {author}/> |
      {/if}
      <i>{date}</i> |
      Reading time: {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
    </p>
  {/if}
  <Markdown
    source={contents}
    {article}
  />
</div>
