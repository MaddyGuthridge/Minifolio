<script lang="ts">
  import { Separator } from '$components';
  import { TextInput } from '$components/base';
  import { CopyButton } from '$components/base/button';
  import type { ItemId } from '$lib/itemId';
  import type { FeedSection } from '$lib/server/data/item/section';
  import { itemAtomUrl } from '$lib/urls';

  type Props = {
    section: FeedSection,
    item: ItemId,
    editing: boolean,
    onchange: () => void,
  };

  let { section = $bindable(), item, editing, onchange }: Props = $props();

  function makeLink() {
    const location = document.location;
    return `${location.host}${itemAtomUrl(item)}`;
  }
</script>

{#snippet display()}
  <div class="display-outer">
    <i class="icon {section.icon ?? 'las la-rss'}"></i>
    <div>
      <h3>{section.label ?? 'Subscribe via RSS/Atom'}</h3>
    </div>
    <CopyButton text={makeLink}>Copy</CopyButton>
  </div>
{/snippet}

<div class="section-main">
  {#if !editing}
    {@render display()}
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
      </div>
      <Separator />
      {@render display()}
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
