<script lang="ts">
  import type { ToastItem } from './toastManager.svelte';

  const toast: ToastItem = $props();
</script>

<div class="toast-item">
  <h3>{toast.title}</h3>
  <p>{toast.message}</p>
</div>
