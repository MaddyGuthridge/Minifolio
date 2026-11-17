<script lang="ts">
  import Button, { type ButtonProps } from './Button.svelte';

  // TypeScript seems to have it figured out, so not sure what ESLint is thinking :/
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  type Props = ButtonProps & { running: boolean };

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
