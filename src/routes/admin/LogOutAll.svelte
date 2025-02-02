<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$components/base';
  import api from '$endpoints';

  async function logOut() {
    await api().admin.auth.revoke();
    await goto('/admin/login');
  }
</script>

<div>
  <h2>Log out of all sessions</h2>
  <p>This will sign you out on all of your devices (including this one).</p>
  <Button onclick={logOut} mode="warning">Log out of all sessions</Button>
</div>
