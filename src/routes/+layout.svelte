<script lang="ts">
  import { ToastDisplay } from '$lib/ui/toast';

  const { children } = $props();
</script>

<ToastDisplay />
{@render children()}
