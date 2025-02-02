<!-- Settings panel for managing the server's public key. -->
<script lang="ts">
  import CopyButton from '$components/CopyButton.svelte';
  import api from '$endpoints';
  import { APP_NAME } from '$lib/consts';
  import { Button, TextInput } from '$components/base';

  type Props = {
    /** Public key currently being used by the server */
    publicKey: string | null;
    /** Path to the server's private key */
    privateKeyPath: string | null;
  };

  let { publicKey = $bindable(), privateKeyPath = $bindable() }: Props =
    $props();

  /** Setting key path */
  let newKeyPath = $state('');

  /** Use the SSH key at the given path */
  async function useKeyAtPath() {
    const newKey = await api().admin.keys.setKeyPath(newKeyPath);
    publicKey = newKey.publicKey;
    privateKeyPath = newKey.keyPath;
    newKeyPath = '';
  }

  /** Generate a new SSH key */
  async function generateNewKey() {
    const newKey = await api().admin.keys.generate();
    publicKey = newKey.publicKey;
    privateKeyPath = newKey.keyPath;
  }

  /** Use system SSH keys */
  async function useSystemSsh() {
    await api().admin.keys.disable();
    publicKey = null;
    privateKeyPath = null;
  }
</script>

{#snippet keyAtPath()}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void useKeyAtPath();
    }}
  >
    <div>Use the given SSH key-pair</div>
    <TextInput bind:value={newKeyPath} placeholder="/path/to/private/key" />
    <Button type="submit">Set SSH key path</Button>
  </form>
{/snippet}

{#snippet generateKey()}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void generateNewKey();
    }}
  >
    <div>Generate a new SSH key-pair</div>
    <Button type="submit">Generate SSH key</Button>
  </form>
{/snippet}

{#snippet systemSsh()}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void useSystemSsh();
    }}
  >
    <div>Use the system's SSH configuration</div>
    <Button type="submit">Use system SSH</Button>
  </form>
{/snippet}

<div>
  <h2>SSH key settings</h2>
  {#if privateKeyPath === null}
    <p>
      <b>{APP_NAME} is using your system's default SSH configuration.</b>
    </p>
    <p>
      Note that in Docker, this may be unset, unless you are forwarding your
      host's SSH agent.
    </p>
    {@render keyAtPath()}
    {@render generateKey()}
  {:else}
    <p>{APP_NAME} is using an SSH key at the path <em>{privateKeyPath}</em>.</p>

    <p>Public key is:</p>
    <pre>{publicKey}</pre>
    <CopyButton text={publicKey ?? ''}>Copy to clipboard</CopyButton>
    {@render keyAtPath()}
    {@render generateKey()}
    {@render systemSsh()}
  {/if}
</div>

<style>
</style>
