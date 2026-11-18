<script lang="ts">
  import Button from '#lib/components/base/button/Button.svelte';
  import ItemCardGrid from '#lib/components/card/ItemCardGrid.svelte';
  import { ItemChipList } from '#lib/components/chip/index.ts';
  import NewItemModal from '#lib/components/modals/NewItemModal.svelte';
  import ItemPicker from '#lib/components/pickers/ItemPicker.svelte';
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

  let newItemModalShown = $state(false);

  let newFilterItem = $state(itemId.ROOT);
</script>

<span class="main-title">
  <h1>Children</h1>
  <span class="grow"></span>
  <Button
    hint="Create a new item"
    onclick={() => { newItemModalShown = true }}
  >
    <i class="las la-plus"></i>
  </Button>
</span>

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

<div>
  <h2>Filters</h2>
  <p>
    All children of the selected items are displayed as filters. Clicking on one of these child
    items filters the list of displayed item cards to only show items that link to the selected
    child filter items.
  </p>
  <ItemChipList
    {portfolio}
    items={[thisItem.info.filters.map(itemId => ({ itemId, selected: false }))]}
  />
  <span class="add-filter-item">
    <ItemPicker id="item-destination-picker" {portfolio} bind:value={newFilterItem} />
    <Button onclick={() => {
      thisItem.info.filters.push(newFilterItem);
      newFilterItem = itemId.ROOT;
      onchange();
    }}>Add filter item</Button>
  </span>
</div>

<NewItemModal
  show={newItemModalShown}
  parent={item}
  onclose={() => (newItemModalShown = false)}
/>

<style>
  .main-title {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .grow {
    flex-grow: 1;
  }
</style>
