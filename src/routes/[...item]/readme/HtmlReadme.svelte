<script lang="ts">
  import * as cheerio from 'cheerio';

  type Props = {
    contents: string;
  };

  const { contents }: Props = $props();

  const htmlBody = $derived.by(() => {
    const document = cheerio.load(contents);
    return document('body').html();
  });
</script>

<div id="readme-html-container">
  <!--
    The content of the HTML is determined by the owner of the site, and so it should be safe
    as long as their document is safe. If it's not, then it's a them problem.
  -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html htmlBody}
</div>
