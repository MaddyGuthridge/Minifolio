<script lang="ts">
  import Markdown from './Markdown.svelte';

  type Props = {
    code: string,
    language: string,
  };

  const { code, language }: Props = $props();

  const ticks = '```';

  const source = $derived(`${ticks}${language}\n${code}\n${ticks}`);
</script>

<Markdown {source} />
