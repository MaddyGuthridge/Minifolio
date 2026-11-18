<script lang="ts">
  import ItemCardGrid from '#lib/components/card/ItemCardGrid.svelte';
  import itemId from '#lib/itemId.ts';
  import type { ItemData } from '#lib/server/data/item/item.ts';
  import type { ItemId } from '#lib/validate.ts';

  type Props = {
    item: ItemId,
    portfolio: ItemData,
    thisItem: ItemData,
    onchange: () => void,
  };

  const { item, portfolio, thisItem = $bindable(), onchange }: Props = $props();

  const displayedItems = $derived(thisItem.info.children.map(id => itemId.child(item, id)));

  const hiddenChildren = $derived(Object.keys(thisItem.children)
    .filter(child => !thisItem.info.children.includes(child)));
</script>

<ItemCardGrid
  portfolio={portfolio}
  itemIds={displayedItems}
  editing
  dndId={`${item}:children`}
  onReorder={(items) => {
    thisItem.info.children = items.map(id => itemId.suffix(id));
    onchange();
  }}
/>

<h2>Hidden children</h2>
<ItemCardGrid
  portfolio={portfolio}
  itemIds={hiddenChildren.map(id => itemId.child(item, id))}
  editing
  dndId={`${item}:children`}
  onDropItem={(droppedItemId) => {
    // When an item is dropped here, remove it from the list of shown children
    const tail = itemId.suffix(droppedItemId);
    thisItem.info.children = thisItem.info.children.filter(
      id => id !== tail,
    );
    onchange();
  }}
/>
