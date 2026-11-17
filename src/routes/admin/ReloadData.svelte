<script>
  import { Button } from '#lib/components/base/index.ts';
  import api from '#lib/endpoints/index.ts';
</script>

<div>
  <h2>Reload data from disk</h2>
  If you have edited your data manually, you can use this button to refresh it.
  <Button onclick={() => api().admin.data.refresh()}>Refresh data</Button>
</div>
