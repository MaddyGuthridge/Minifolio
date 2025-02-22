<script lang="ts">
  import type { ToastItem } from './toastManager.svelte';
  import { fly } from 'svelte/transition';

  const toast: ToastItem = $props();
</script>

<div
  class="toast-item"
  style:--color={toast.color}
  transition:fly={{ x: 200 }}
>
  <h3>{toast.title}</h3>
  <p>{toast.message}</p>
</div>

<style>
  .toast-item {
    background-color: var(--color);
    border-radius: 10px;
    padding: 20px 30px;

    & p, & h3 {
      margin: 0;
    }

    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
  }
</style>
