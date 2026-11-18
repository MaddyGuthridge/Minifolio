<script lang="ts">
  import { Button, Select, TextInput } from '#lib/components/base/index.ts';
  import { ItemPicker } from '#lib/components/pickers/index.ts';
  import Links from '#lib/components/sections/Links.svelte';
  import itemId, { type ItemId } from '#lib/itemId.ts';
  import { linkDisplayStyles } from '#lib/links.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { LinksSection } from '#lib/server/data/item/section.ts';
  import { capitalize } from '#lib/util.ts';

  type Props = {
    portfolio: ItemData,
    section: LinksSection,
    onchange: () => void,
  };

  const {
    portfolio,
    section = $bindable(),
    onchange,
  }: Props = $props();

  let newLinkId: ItemId = $state(itemId.ROOT);

  function addNewLink() {
    section.items.push(newLinkId);
    // newLinkId = itemId.ROOT;
    onchange();
  }
</script>

<div class="edit-outer">
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
    <label for="links-item-picker">Add item</label>
    <div class="item-picker-control">
      <ItemPicker id="links-item-picker" {portfolio} bind:value={newLinkId} />
      <Button onclick={addNewLink}>Add</Button>
    </div>
  </div>
  <Links {section} {portfolio} link={false} />
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
