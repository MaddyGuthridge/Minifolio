<script lang="ts">
  import { Button, TextInput } from '$components/base';
  import api from '$endpoints';
  import { objectAll } from '$lib/util';
  import validate from '$lib/validate';
  import validator from 'validator';

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

  const valuesOk = $state({
    username: true,
    ogPassword: false,
    newPassword: false,
    repeatPassword: false,
  });

  const canSubmit = $derived(objectAll(valuesOk));
</script>

<div>
  <h2>Change authentication</h2>
  <form onsubmit={submitChangePassword}>
    <!-- Username field -->
    <label for="username">Username</label>
    <TextInput
      id="username"
      placeholder="Your account username"
      bind:value={username}
      validator={(username) => validate.id('Username', username)}
      bind:valueOk={valuesOk.username}
    />
    <!-- Original password field -->
    <label for="original-password">Original password</label>
    <TextInput
      id="original-password"
      password
      placeholder="Your original password"
      bind:value={originalPassword}
      validator={(p) => validate.nonEmpty(p)}
      bind:valueOk={valuesOk.ogPassword}
    />
    <!-- New password field -->
    <label for="new-password">New password</label>
    <TextInput
      id="new-password"
      password
      placeholder="A unique and secure password"
      bind:value={newPassword}
      validator={(p) => {
        if (!validator.isStrongPassword(p)) {
          throw Error('Password is not strong enough');
        }
      }}
      bind:valueOk={valuesOk.newPassword}
    />
    <!-- Repeat new password field -->
    <label for="repeat-password">Repeat new password</label>
    <TextInput
      id="repeat-password"
      password
      placeholder="Your new password again"
      bind:value={repeatNewPassword}
      errorText={newPassword !== repeatNewPassword
        ? 'New password fields must match'
        : undefined}
      bind:valueOk={valuesOk.repeatPassword}
    />
    <div>
      <Button
        type="submit"
        disabled={!canSubmit}
        hint={canSubmit ? undefined : 'Please ensure all form data is correct'}
      >
        Change password
      </Button>
    </div>
  </form>
</div>

<style>
  form {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
  }

  label {
    display: flex;
    align-items: center;
  }
</style>
