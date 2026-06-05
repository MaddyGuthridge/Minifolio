<script lang="ts">
  import { ToastDisplay } from '$lib/ui/toast';

  const { children } = $props();
</script>

<ToastDisplay />
{@render children()}

<style>
  @media (prefers-color-scheme: dark) {
    :global(body) {
      background-color: #111111;
      color: white;
    }
    :global(a) {
      color: #9999ff;
    }
    :global(a:visited) {
      color: #ff88ff;
    }
  }
</style>
