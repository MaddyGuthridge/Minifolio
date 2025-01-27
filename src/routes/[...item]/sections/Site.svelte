<script lang="ts">
  import { Separator } from '$components';
  import type { SiteSection } from '$lib/server/data/item/section';

  type Props = SiteSection & {
    editing: boolean;
  };

  let { label = $bindable(), url = $bindable(), editing }: Props = $props();
</script>

{#snippet display(link: boolean)}
  {#if link}
    <a href={url} target="_blank" class="display-outer">
      <i class="las la-globe"></i>
      <h3>{label ?? 'Visit the website'}</h3>
    </a>
  {:else}
    <div class="display-outer">
      <i class="las la-globe"></i>
      <h3>{label ?? 'Visit the website'}</h3>
    </div>
  {/if}
{/snippet}

{#if !editing}
  {@render display(true)}
{:else}
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="site-label-text">Label text</label>
      <input
        type="text"
        id="site-label-text"
        bind:value={label}
        placeholder="Label text"
      />
      <label for="site-url">Website URL</label>
      <input
        type="url"
        id="site-url"
        bind:value={url}
        placeholder="Website URL"
        required
      />
    </div>
    <Separator />
    {@render display(true)}
  </div>
{/if}

<style>
  .display-outer {
    text-decoration: none;
    color: black;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .las {
    font-size: 5rem;
  }

  .edit-outer {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .edit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
</style>
