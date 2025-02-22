<script lang="ts">
  import Toast from './Toast.svelte';
  import { toasts } from './toastManager.svelte';
</script>

<div id="toast-display">
  {#each toasts as toast}
    <Toast {...toast} />
  {/each}
</div>
