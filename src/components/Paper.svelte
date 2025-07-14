<script lang="ts">
  import { type Snippet } from 'svelte';
  type Props = {
    opacity?: number,
    children?: Snippet,
  };

  const { opacity = 0.75, children }: Props = $props();
</script>

<div class="paper" style="--opacity: {opacity}">
  {#if children}
    {@render children?.()}
  {/if}
</div>

<style>
  .paper {
    width: 80%;
    border-radius: 10px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.37);
    background-color: rgba(255, 255, 255, var(--opacity));
  }
  @media only screen and (max-width: 600px) {
    .paper {
      width: 95%;
    }
  }
</style>
