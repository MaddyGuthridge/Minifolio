<script lang="ts">
  import { withLightness } from '$lib/color';
  import { tooltip } from '$lib/ui';
  import { colord } from 'colord';

  type Props = {
    /** Name to show for chip */
    name: string;
    /** Description to show on hover */
    description: string;
    /** Color to use for the chip */
    color: string;
    /** Link behavior options */
    link?: { url: string; newTab: boolean };
    /** Whether the chip should render as selected (filled) */
    selected?: boolean;
    /** Callback when the chip is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void;
  };

  const {
    name,
    description,
    color,
    link,
    onclick,
    selected = false,
  }: Props = $props();

  const fillColor = $derived(
    selected
      ? withLightness(colord(color), 75).toHex()
      : withLightness(colord(color), 85).toHex(),
  );
  const borderColor = $derived(
    selected
      ? withLightness(colord(color), 40).toHex()
      : withLightness(colord(color), 50).toHex(),
  );
  const hoverColor = $derived(withLightness(colord(color), 60).toHex());
  const borderWidth = $derived(selected ? '2px' : '1px');
</script>

<a {onclick} href={link?.url}>
  <!-- Annoying code duplication. Need to find a way to make a `use` directive optional -->
  {#if description.length}
    <div
      use:tooltip={{ content: description }}
      style:--fill-color={fillColor}
      style:--border-color={borderColor}
      style:--hover-color={hoverColor}
      style:--border-width={borderWidth}
    >
      {name}
    </div>
  {:else}
    <div
      style:--fill-color={fillColor}
      style:--border-color={borderColor}
      style:--hover-color={hoverColor}
      style:--border-width={borderWidth}
    >
      {name}
    </div>
  {/if}
</a>

<style>
  a {
    color: black;
    text-decoration: none;
  }
  div {
    margin: 2px;
    background-color: var(--fill-color);
    border-color: transparent;
    border-style: solid;
    border-radius: 30px;
    border-width: 2px;
    box-shadow: 0 0 0 var(--border-width) var(--border-color);
    padding: 5px 10px;
    width: min-content;
    text-wrap: nowrap;
    transition:
      border-color 0.5s,
      background-color 0.5s;
  }
  div:hover {
    background-color: var(--hover-color);
    cursor: pointer;
  }
</style>
