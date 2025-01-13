<script lang="ts">
  import ItemCardGrid from '$components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '$components/chip';
  import type { ItemData } from '$lib/server/data/item';
  import type { LinksSection } from '$lib/server/data/item/section';

  type Props = LinksSection & {
    portfolio: ItemData;
    editing: boolean;
  };

  const { portfolio, editing, label, style, items }: Props = $props();
</script>

<b>{label}</b>
{#if style === 'chip'}
  <ItemChipList
    {portfolio}
    items={[items.map((i) => ({ itemId: i, selected: false }))]}
    link
    onclick={() => {}}
    onfilter={() => {}}
  />
{:else}
  <ItemCardGrid
    {portfolio}
    itemIds={items}
    {editing}
    onclick={() => {}}
  />
{/if}
