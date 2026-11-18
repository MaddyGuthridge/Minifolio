<script lang="ts">
  import { Separator } from '#lib/components/index.ts';
  import { TextInput } from '#lib/components/base/index.ts';
  import FilePicker from '#lib/components/pickers/FilePicker.svelte';
  import { getDescendant } from '#lib/itemData.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { DownloadSection } from '#lib/server/data/item/section.ts';
  import Download from '#lib/components/sections/Download.svelte';

  type Props = {
    item: ItemId,
    portfolio: ItemData,
    section: DownloadSection,
    onchange: () => void,
  };

  let { item, portfolio, section = $bindable(), onchange }: Props = $props();

  const thisItem = $derived(getDescendant(portfolio, item));
</script>

<div class="section-main">
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
    <Download {item} {section} link={false} />
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
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
