<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  import Modal from './Modal.svelte';
    import api from '$endpoints';
    import { goto } from '$app/navigation';
  export let show: boolean;

  let groupName = '';
  let groupId = '';
  let groupDescription = '';
  let userModifiedId = false;

  const dispatch = createEventDispatcher();

  function resetAndClose() {
    groupName = '';
    groupDescription = '';
    groupId = '';
    userModifiedId = false;
    dispatch('close');
  }

  function nameToId(name: string): string {
    // TODO: Make this a little more reliable
    return name.toLowerCase().replaceAll(' ', '-');
  }

  async function makeGroup() {
    await api().group.withId(groupId).create(groupName, groupDescription);
    await goto(`/${groupId}`);
  }
</script>

<Modal {show} on:close={resetAndClose}>
  <h2 slot="header">New group</h2>
  <form on:submit|preventDefault={makeGroup}>
    <p>
      Group name
      <input
        placeholder="Projects"
        bind:value={groupName}
        required
        on:input={() => {
          // Whenever the user modifies the name, we should update the ID
          // to match, until the user modifies the ID themselves
          if (!userModifiedId) {
            groupId = nameToId(groupName);
          }
        }}
      />
    </p>
    <p>
      Group ID
      <input placeholder="projects" required bind:value={groupId} on:input={() => { userModifiedId = true; }} />
    </p>
    <p>
      Group description
      <input placeholder="Projects I have created" bind:value={groupDescription} />
    </p>
    <p>
      <input type="submit" value="Create" />
    </p>
  </form>
</Modal>

<style>
  form {
    margin: 10px;
  }

  form p {
    display: flex;
    gap: 10px;
    width: 100%;
  }
  form p input {
    flex: 1;
    height: 1.2rem;
  }

  input[type="submit"] {
    height: 2rem;
    background-color: transparent;
    border: none;
    border-radius: 5px;
  }

  input[type="submit"]:hover {
    background-color: rgba(124, 124, 124, 0.253);
    cursor: pointer;
  }
</style>
