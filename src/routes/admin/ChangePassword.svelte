<script lang="ts">
  import { Button } from '$components/base';
  import api from '$endpoints';

  type Props = {
    username: string;
  };

  let { username = $bindable() }: Props = $props();
  let originalPassword = $state('');
  let newPassword = $state('');
  let repeatNewPassword = $state('');

  async function submitChangePassword() {
    await api().admin.auth.change(username, originalPassword, newPassword);
    originalPassword = '';
    newPassword = '';
    repeatNewPassword = '';
  }
</script>

<div>
  <h2>Change authentication</h2>
  <form onsubmit={submitChangePassword}>
    <p>
      Username
      <br />
      <input placeholder="Your account username" bind:value={username} />
    </p>
    <p>
      Original password
      <br />
      <input
        type="password"
        placeholder="Your original password"
        bind:value={originalPassword}
      />
    </p>
    <p>
      New password
      <br />
      <input
        type="password"
        placeholder="A unique and secure password"
        bind:value={newPassword}
      />
    </p>
    <p>
      Repeat new password
      <br />
      <input
        type="password"
        placeholder="Your new password again"
        bind:value={repeatNewPassword}
      />
    </p>
    {#if newPassword != repeatNewPassword}
      <p>New passwords much match</p>
    {/if}
    <p>
      <Button type="submit" disabled={newPassword != repeatNewPassword}>Change password</Button>
    </p>
  </form>
</div>
