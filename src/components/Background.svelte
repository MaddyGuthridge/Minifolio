<script lang="ts">
  import { randomChoice } from '$lib/util';
  import { colord } from 'colord';
  import ColorSplotch, { type Splotch } from './ColorSplotch.svelte';
  import { withLightness } from '$lib/color';

  type Props = {
    color: string,
    position?: string,
    posUnits?: string,
    spreadScale?: number,
  };

  const { color, position = 'absolute', posUnits = '%', spreadScale = 100 }: Props = $props();

  // Possible positions for the background splotches, in % units.
  // x positions should stay off the page
  const possiblePositionsX = [
    -15, -10, -5, 0, 5, 10, 90, 95, 100, 105, 110, 115,
  ];
  // y positions can be anywhere, since x is generally off the page
  // Values from -25% to 175%
  const possiblePositionsY = [...Array(40).keys()].map(i => i * 5 - 25);

  // Possible values for spread of splotch blur, as a percentage of the viewport width
  const possibleSpreads: number[] = [1, 2, 3, 4];

  // Possible offsets of hue values, in degrees
  const hueOffsets = [-25, -15, -10, -5, 0, 0, 5, 10, 15, 25];

  const numSplotches = 15;

  /**
   * Color hue offsets, picked based on the given color.
   *
   * Each color is of the form `{ color, posX, posY, spread }`
   */
  const colors: Splotch[] = $derived(
    [...Array(numSplotches).keys()].map(() => {
      const base = colord(color);
      const hueDiff = randomChoice(hueOffsets);
      const newColor = withLightness(base.hue(base.hue() + hueDiff), 50).toHex();
      const x = randomChoice(possiblePositionsX);
      const y = randomChoice(possiblePositionsY);
      const spread = randomChoice(possibleSpreads);

      return {
        color: newColor,
        x: `${x}${posUnits}`,
        y: `${y}${posUnits}`,
        spread: `${spread * spreadScale}px`,
        position,
      };
    }),
  );
</script>

<div id="background">
  {#each colors as splotch, i (i)}
    <ColorSplotch {...splotch} />
  {/each}
</div>

<style>
  #background {
    z-index: -1;
    min-width: 100%;
    min-height: 100%;
  }
</style>
