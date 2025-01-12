<script lang="ts">
  import type { SiteSection } from '$lib/server/data/item/section';

  type Props = SiteSection & {
    editing: boolean;
  };

  let { label = $bindable(), url = $bindable(), editing }: Props = $props();
</script>

{#if !editing}
  <a href={url}>
    <b>{label ?? 'Visit the website'}</b>
  </a>
{:else}
  <input type="url" bind:value={url} placeholder="Website URL" required />
  <input type="text" bind:value={label} placeholder="Label text" />
{/if}
