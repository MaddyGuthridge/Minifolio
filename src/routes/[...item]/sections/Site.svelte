<script lang="ts">
  import { Separator } from '$components';
  import type { SiteSection } from '$lib/server/data/item/section';

  type Props = {
    section: SiteSection;
    editing: boolean;
    onchange: () => void;
  };

  let { section = $bindable(), editing, onchange }: Props = $props();
</script>

{#snippet display(link: boolean)}
  {#if link}
    <a href={section.url} target="_blank" class="display-outer">
      <i class="las {section.icon ?? 'la-globe'}"></i>
      <h3>{section.label ?? 'Visit the website'}</h3>
    </a>
  {:else}
    <div class="display-outer">
      <i class="las la-globe"></i>
      <h3>{section.label ?? 'Visit the website'}</h3>
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
        bind:value={section.label}
        oninput={onchange}
        placeholder="Label text"
      />
      <label for="site-icon">
        <a href="https://icons8.com/line-awesome" target="_blank">Icon</a>
      </label>
      <input
        type="text"
        id="site-icon"
        bind:value={section.icon}
        oninput={onchange}
        placeholder="la-globe"
      />
      <label for="site-url">Website URL</label>
      <input
        type="url"
        id="site-url"
        bind:value={section.url}
        oninput={onchange}
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
