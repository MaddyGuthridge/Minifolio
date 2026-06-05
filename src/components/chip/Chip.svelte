<script lang="ts">
  import { withLightness } from '$lib/color';
  import { tooltip } from '$lib/ui';
  import { colord } from 'colord';

  type Props = {
    /** Name to show for chip */
    name: string,
    /** Description to show on hover */
    description: string,
    /** Color to use for the chip */
    color: string,
    /** Link behavior options */
    link?: { url: string, newTab: boolean },
    /** Whether the chip should render as selected (filled) */
    selected?: boolean,
    /** Callback when the chip is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void,
  };

  const {
    name,
    description,
    color,
    link,
    onclick,
    selected = false,
  }: Props = $props();

  const mkColor = (lightness: number) => withLightness(colord(color), lightness).toHex();

  const fillColorLight = $derived(
    selected
      ? mkColor(75)
      : mkColor(80),
  );
  const fillColorDark = $derived(
    selected
      ? mkColor(50)
      : mkColor(30),
  );
  const borderColorLight = $derived(
    selected
      ? mkColor(40)
      : mkColor(50),
  );
  const borderColorDark = $derived(
    selected
      ? mkColor(80)
      : mkColor(50),
  );
  const hoverColor = $derived(mkColor(60));
  const borderWidth = $derived(selected ? '2px' : '1px');
</script>

<a {onclick} href={link?.url}>
  <!-- Annoying code duplication. Need to find a way to make a `use` directive optional -->
  {#if description.length}
    <div
      use:tooltip={{ content: description }}
      style:--fill-color-light={fillColorLight}
      style:--fill-color-dark={fillColorDark}
      style:--border-color-light={borderColorLight}
      style:--border-color-dark={borderColorDark}
      style:--hover-color={hoverColor}
      style:--border-width={borderWidth}
    >
      {name}
    </div>
  {:else}
    <div
      style:--fill-color-light={fillColorLight}
      style:--fill-color-dark={fillColorDark}
      style:--border-color-light={borderColorLight}
      style:--border-color-dark={borderColorDark}
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
    background-color: var(--fill-color-light);
    border-color: transparent;
    border-style: solid;
    border-radius: 30px;
    border-width: 2px;
    box-shadow: 0 0 0 var(--border-width) var(--border-color-light);
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
  @media (prefers-color-scheme: dark) {
    a {
      color: white;
    }
    div {
      background-color: var(--fill-color-dark);
      box-shadow: 0 0 0 var(--border-width) var(--border-color-dark);
    }
  }
</style>
