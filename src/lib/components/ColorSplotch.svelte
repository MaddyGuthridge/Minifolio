<script lang="ts">
  export type Splotch = {
    color: string,
    x: string,
    y: string,
    spread: string,
    position?: string,
  };

  const { color, x, y, spread, position }: Splotch = $props();
</script>

<div
  class="dot"
  style:--color={color}
  style:--x={x}
  style:--y={y}
  style:--spread={spread}
  style:--position={position}
></div>

<style>
  .dot {
    z-index: -1;
    width: 0;
    height: 0;
    position: var(--position);
    left: var(--x);
    top: var(--y);
    box-shadow: 0 0 calc(var(--spread) * 2) var(--spread) var(--color);
    transition: all 0.5s;
    filter: opacity(0.2);
  }

  @media (prefers-reduced-motion) {
    .dot {
      transition: all 0s;
    }
  }

  @media (prefers-contrast: more), (prefers-reduced-transparency) {
    .dot {
      box-shadow: none;
    }
  }
</style>
