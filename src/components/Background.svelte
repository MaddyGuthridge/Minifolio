<script lang="ts">
  import { withLightness } from '$lib/color';
  import { randomChoice } from '$lib/util';
  import { colord } from 'colord';

  type Props = {
    color: string;
  };

  const { color }: Props = $props();

  // Possible positions for the background splotches, in % units.
  // x positions should stay off the page
  const possiblePositionsX = [
    -15, -10, -5, 0, 5, 10, 90, 95, 100, 105, 110, 115,
  ];
  // y positions can be anywhere, since x is generally off the page
  // Values from -25% to 175%
  const possiblePositionsY = [...Array(40).keys()].map((i) => i * 5 - 25);

  // Possible values for spread of splotch blur, as a percentage of the viewport width
  const possibleSpreads: number[] = [5, 10, 15, 20];

  // Possible offsets of hue values, in degrees
  const hueOffsets = [-25, -15, -10, -5, 0, 0, 5, 10, 15, 25];

  const numSplotches = 15;

  type Splotch = {
    color: string;
    x: string;
    y: string;
    spread: string;
  };

  /**
   * Color hue offsets, picked based on the given color.
   *
   * Each color is of the form `[color, posX, posY, spread]`
   */
  const colors: Splotch[] = $derived(
    [...Array(numSplotches).keys()].map(() => {
      const base = colord(color);
      const hueDiff = randomChoice(hueOffsets);
      const newColor = withLightness(base.hue(base.hue() + hueDiff), 85).toHex();
      const x = randomChoice(possiblePositionsX);
      const y = randomChoice(possiblePositionsY);
      const spread = randomChoice(possibleSpreads);

      return { color: newColor, x: `${x}%`, y: `${y}%`, spread: `${spread}vw` };
    }),
  );
</script>

<div id="background">
  {#each colors as { color: c, x, y, spread }}
    <div
      class="dot"
      style:--c={c}
      style:--x={x}
      style:--y={y}
      style:--spread={spread}
    ></div>
  {/each}
</div>

<style>
  #background {
    z-index: -1;
    min-width: 100%;
    min-height: 100%;
    overflow: hidden;
  }

  .dot {
    z-index: -1;
    width: 0;
    height: 0;
    position: absolute;
    left: var(--x);
    top: var(--y);
    box-shadow: 0 0 1000px var(--spread) var(--c);
    transition: all 0.5s;
  }

  @media (prefers-reduced-motion) {
    .dot {
      transition: all 0s;
    }
  }
</style>
