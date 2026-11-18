<script lang="ts">
  import ItemCardGrid from '#lib/components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '#lib/components/chip/index.ts';
  import type { ItemData } from '#lib/server/data/item/index.ts';
  import type { LinksSection } from '#lib/server/data/item/section.ts';

  type Props = {
    portfolio: ItemData,
    section: LinksSection,
    link: boolean,
  };

  const {
    portfolio,
    section,
    link,
  }: Props = $props();

</script>

{#if section.style === 'chip'}
  <div class="link-chips">
    <h3>{section.label}</h3>
    <ItemChipList
      {portfolio}
      items={[section.items.map(i => ({ itemId: i, selected: false }))]}
      {link}
    />
  </div>
{:else}
  <h2>{section.label}</h2>
  <ItemCardGrid {portfolio} itemIds={section.items} editing={false} />
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
