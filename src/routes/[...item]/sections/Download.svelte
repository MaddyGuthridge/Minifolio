<script lang="ts">
  import { Separator } from '$components';
  import { TextInput } from '$components/base';
  import FilePicker from '$components/pickers/FilePicker.svelte';
    import { getDescendant } from '$lib/itemData';
  import type { ItemId } from '$lib/itemId';
    import type { ItemData } from '$lib/server/data/item';
  import type { DownloadSection } from '$lib/server/data/item/section';
  import { itemFileUrl } from '$lib/urls';

  type Props = {
    item: ItemId;
    portfolio: ItemData;
    section: DownloadSection;
    editing: boolean;
    onchange: () => void;
  };

  let { item, portfolio, section = $bindable(), editing, onchange }: Props = $props();

  const thisItem = $derived(getDescendant(portfolio, item));
</script>

{#snippet display(link: boolean)}
  {#if link}
    <a href={itemFileUrl(item, section.file)} download class="display-outer">
      <i class="icon las la-download"></i>
      <div>
        <h3>{section.label ?? 'Download'}</h3>
        <p><b><u>{section.file}</u></b></p>
      </div>
    </a>
  {:else}
    <div class="display-outer">
      <i class="icon las la-download"></i>
      <div>
        <h3>{section.label ?? 'Download'}</h3>
        <p><b><u>{section.file}</u></b></p>
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
        <label for="site-url">File</label>
        <FilePicker files={thisItem.ls} bind:selected={section.file} forceSelection {onchange} />
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
