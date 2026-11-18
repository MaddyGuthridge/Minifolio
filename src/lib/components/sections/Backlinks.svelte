<script lang="ts">
  import ItemCardGrid from '#lib/components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '#lib/components/chip/index.ts';
  import { getDescendant } from '#lib/itemData.ts';
  import itemId, { type ItemId } from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { BacklinksSection } from '#lib/server/data/item/section.ts';

  type Props = {
    item: ItemId,
    portfolio: ItemData,
    section: BacklinksSection,
    link: boolean,
  };

  const { item, portfolio, section, link }: Props = $props();

  const parent = $derived(getDescendant(portfolio, section.parentItem));
  const backlinkItems = $derived(
    parent.info.children
      .map(child => itemId.child(section.parentItem, child))
      .filter(childId =>
        getDescendant(portfolio, childId).info.sections.find(
          sect => sect.type === 'links' && sect.items.includes(item),
        ) !== undefined));
</script>

{#if section.style === 'chip'}
  <div class="link-chips">
    <h3>{section.label}</h3>
    <ItemChipList
      {portfolio}
      items={[backlinkItems.map(i => ({ itemId: i, selected: false }))]}
      {link}
    />
  </div>
{:else}
  <h2>{section.label}</h2>
  <ItemCardGrid {portfolio} itemIds={backlinkItems} editing={false} />
{/if}

<style>
  .link-chips {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .link-chips h3 {
    margin: 0;
  }
</style>
