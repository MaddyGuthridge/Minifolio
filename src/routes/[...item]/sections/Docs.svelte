<script lang="ts">
  import type { DocsSection } from '$lib/server/data/item/section';

  type Props = DocsSection & {
    editing: boolean;
  };

  let { label = $bindable(), url = $bindable(), editing }: Props = $props();
</script>

{#if !editing}
  <a href={url}>
    <i class="las la-book-open"></i>
    <b>{label ?? 'View the documentation'}</b>
  </a>
{:else}
  <input type="url" bind:value={url} placeholder="Documentation URL" required />
  <input type="text" bind:value={label} placeholder="Label text" />
{/if}
