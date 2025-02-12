<script lang="ts">
  import Button from './Button.svelte';

  type Props = {
    text: string;
    hint?: string;
    children?: import('svelte').Snippet;
  };

  const { text, hint = 'Copy', children }: Props = $props();

  function copy() {
    void navigator.clipboard.writeText(text);
  }
</script>

<Button onclick={copy} {hint}>
  <div class="copy-btn">
    {@render children?.()}
  </div>
</Button>

<style>
  .copy-btn {
    display: flex;
    align-items: center;
    gap: 5px;
  }
</style>
