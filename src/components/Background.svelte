<script lang="ts">
  import { scaleLightness } from '$lib/color';
  import { colord } from 'colord';

  type Props = {
    color: string;
  };

  let { color }: Props = $props();

  /** Possible positions for the background splotches */
  const possiblePositions: [number, number][] = [
    [0, 10],
    [-5, 45],
    [60, 15],
    [95, 85],
    [30, 110],
    [20, 15],
    [80, 30],
    [90, 10],
    [10, 80],
    [5, 95],
    [45, 80],
  ];

  const possibleSpreads: number[] = [100, 150, 300, 500];

  /** Color hue offsets, picked based on the given color */
  let colors = $derived(
    [-25, -15, -10, -5, 0, 0, 5, 10, 15, 25].map((hueDiff) => {
      const base = colord(color);
      const newColor = scaleLightness(
        base.hue(base.hue() + hueDiff),
        85,
      ).toHex();
      const [posX, posY] =
        possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
      const spread =
        possibleSpreads[Math.floor(Math.random() * possibleSpreads.length)];

      return [newColor, `${posX}%`, `${posY}%`, `${spread}px`] as [
        string,
        string,
        string,
        string,
      ];
    }),
  );
</script>

<div id="background">
  {#each colors as [c, x, y, spread]}
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
  }

  .dot {
    z-index: -1;
    width: 0;
    height: 0;
    position: absolute;
    left: var(--x);
    top: var(--y);
    box-shadow: 0 0 1000px var(--spread) var(--c);
  }
</style>
