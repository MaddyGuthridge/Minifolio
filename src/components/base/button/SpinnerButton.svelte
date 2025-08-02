<script lang="ts">
  import Button, { type ButtonProps } from './Button.svelte';

  // TypeScript seems to have it figured out, so not sure what ESLint is thinking :/
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  type Props = ButtonProps & { running: boolean };

  // Buttons have a huge number of props, I don't want to manually specify all of them. Since I'm
  // not creating a custom HTML element, this should be fine.
  // eslint-disable-next-line svelte/valid-compile
  const { children, running, ...rest }: Props = $props();
</script>

<Button {...rest}>
  <div>
    {#if running}
      <div class="spin">
        <i class="las la-sync"></i>
      </div>
    {/if}
    {@render children()}
  </div>
</Button>

<style>
  div {
    display: flex;
    gap: 10px;
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .spin {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: rotating 2s linear infinite;
  }
</style>
