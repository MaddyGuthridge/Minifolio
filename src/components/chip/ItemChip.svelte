<script lang="ts">
  import { type ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item';
  import Chip from './Chip.svelte';

  type Props = {
    item: ItemData,
    itemId: ItemId,
    link?: boolean,
    selected?: boolean,
    /** Callback for when the element is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void,
  };

  const {
    item,
    itemId,
    link = false,
    selected = false,
    onclick,
  }: Props = $props();
</script>

<Chip
  name={item.info.name}
  description={item.info.description}
  color={item.info.color}
  {selected}
  link={link ? { url: itemId, newTab: false } : undefined}
  {onclick}
/>
