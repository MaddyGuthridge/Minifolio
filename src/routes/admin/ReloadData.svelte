<script>
  import { Button } from '$components/base';
  import api from '$endpoints';
</script>

<div>
  <h2>Reload data from disk</h2>
  If you have edited your data manually, you can use this button to refresh it.
  <Button onclick={() => api().admin.data.refresh()}>Refresh data</Button>
</div>
