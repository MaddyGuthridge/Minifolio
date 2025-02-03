<script lang="ts">
  import { Separator } from '$components';
  import { TextInput } from '$components/base';
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
      <i class="icon {section.icon ?? 'las la-globe'}"></i>
      <div>
        <h3>{section.label ?? 'Visit the website'}</h3>
        <p><b><u>{section.url}</u></b></p>
      </div>
    </a>
  {:else}
    <div class="display-outer">
      <i class="icon {section.icon ?? 'las la-globe'}"></i>
      <div>
        <h3>{section.label ?? 'Visit the website'}</h3>
        <p><b><u>{section.url}</u></b></p>
      </div>
    </div>
  {/if}
{/snippet}

<div class="section-main">
  {#if !editing}
    {@render display(true)}
  {:else}
    <div class="edit-outer">
      <div class="edit-grid">
        <label for="site-label-text">Label text</label>
        <TextInput
          id="site-label-text"
          bind:value={section.label}
          oninput={onchange}
          placeholder="Label text"
        />
        <label for="site-icon">
          <a href="https://icons8.com/line-awesome" target="_blank">Icon</a>
        </label>
        <TextInput
          id="site-icon"
          bind:value={section.icon}
          oninput={onchange}
          placeholder="las la-globe"
        />
        <label for="site-url">Website URL</label>
        <TextInput
          id="site-url"
          bind:value={section.url}
          oninput={onchange}
          placeholder="Website URL"
          required
        />
      </div>
      <Separator />
      {@render display(false)}
    </div>
  {/if}
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  h3,
  p {
    margin: 0;
  }

  .display-outer {
    text-decoration: none;
    color: black;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .icon {
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

  label {
    display: flex;
    align-items: center;
  }
</style>
