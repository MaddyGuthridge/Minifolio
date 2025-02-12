<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div class="card-list">
  {@render children()}
</div>

<style>
  .card-list {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: center;
  }
</style>
