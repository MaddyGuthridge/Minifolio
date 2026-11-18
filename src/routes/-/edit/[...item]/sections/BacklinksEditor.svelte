<script lang="ts">
  import { Select, TextInput } from '#lib/components/base/index.ts';
  import { ItemPicker } from '#lib/components/pickers/index.ts';
  import Backlinks from '#lib/components/sections/Backlinks.svelte';
  import { type ItemId } from '#lib/itemId.ts';
  import { linkDisplayStyles } from '#lib/links.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { BacklinksSection } from '#lib/server/data/item/section.ts';
  import { capitalize } from '#lib/util.ts';

  type Props = {
    item: ItemId,
    portfolio: ItemData,
    section: BacklinksSection,
    onchange: () => void,
  };

  const {
    item: item,
    portfolio,
    section = $bindable(),
    onchange,
  }: Props = $props();
</script>

<div class="edit-outer">
  <p>Children of the selected item which link to this item will be shown.</p>
  <div class="edit-grid">
    <label for="links-label-text">Label text</label>
    <TextInput
      id="links-label-text"
      bind:value={section.label}
      oninput={onchange}
      placeholder="See also"
    />
    <label for="links-style">Display style</label>
    <Select id="links-style" bind:value={section.style} {onchange}>
      {#each linkDisplayStyles as style (style)}
        <option value={style}>{capitalize(style)}</option>
      {/each}
    </Select>
    <label for="links-item-picker">Parent item</label>
    <div class="item-picker-control">
      <ItemPicker
        id="links-item-picker"
        {portfolio}
        bind:value={section.parentItem}
        {onchange}
      />
    </div>
  </div>
  <Backlinks {item} {portfolio} {section} link={false} />
</div>

<style>
  .edit-outer {
    display: flex;
    flex-direction: column;
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

  .item-picker-control {
    display: flex;
    gap: 5px;
  }
</style>
