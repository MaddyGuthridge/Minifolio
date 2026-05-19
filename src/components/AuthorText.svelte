<script lang="ts">
  import type { AuthorInfo } from '$lib/server/data/item/item';
  import { fediverseHandleToUrl } from '$lib/social';

  type Props = {
    author: AuthorInfo,
  };

  const { author }: Props = $props();

</script>

<span>
  <!-- If they have a name, use that -->
  {#if author.name}
    <!-- If they have a URI, link that -->
    {#if author.uri}
      <a href={author.uri} target="_blank">{author.name}</a>
      <!-- Otherwise, just show their name -->
    {:else}
      {author.name}
    {/if}
  {:else if author.uri}
    <!-- If they just have a URI, link it -->
    <a href={author.uri} target="_blank">{author.uri}</a>
  {:else if author.email}
    <!-- If they just have an email, link it -->
    <a href={`mailto:${author.email}`}>{author.email}</a>
  {:else if author.fediverse}
    <!-- Otherwise, link to their fediverse -->
    <a href={fediverseHandleToUrl(author.fediverse)} target="_blank">{author.fediverse}</a>
  {/if}

</span>

<style>
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
</style>
