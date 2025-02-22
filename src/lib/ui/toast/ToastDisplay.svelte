<script lang="ts">
  import { flip } from 'svelte/animate';
  import Toast from './Toast.svelte';
  import { toasts } from './toastManager.svelte';
</script>

<div id="toast-display">
  {#each toasts as toast (toast.id)}
    <div animate:flip={{ duration: 200 }}>
      <Toast {...toast} />
    </div>
  {/each}
</div>

<style>
  #toast-display {
    position: fixed;
    top: 85px;
    right: 20px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
