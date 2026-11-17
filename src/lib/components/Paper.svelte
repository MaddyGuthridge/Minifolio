<script lang="ts">
  import { type Snippet } from 'svelte';
  type Props = {
    opacity?: number,
    children?: Snippet,
  };

  const { opacity = 0.75, children }: Props = $props();
</script>

<div class="paper" style:--opacity={opacity}>
  {#if children}
    {@render children?.()}
  {/if}
</div>

<style>
  .paper {
    width: 80%;
    border-radius: 10px;
    box-shadow: 5px 5px 10px #00000044;
    background-color: rgba(255, 255, 255, var(--opacity));
  }
  @media only screen and (max-width: 600px) {
    .paper {
      width: 95%;
    }
  }
  @media (prefers-color-scheme: dark) {
    .paper {
      box-shadow: 5px 5px 10px #ffffff44;
      background-color: rgba(40, 40, 40, var(--opacity));
    }
  }
</style>
