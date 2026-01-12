<script lang="ts">
  import Modal from './Modal.svelte';
  import itemId, { type ItemId } from '$lib/itemId';
  import api from '$endpoints';
  import { goto } from '$app/navigation';
  import consts from '$lib/consts';
  import { Button, TextInput } from '$components/base';
  import validate from '$lib/validate';
  import { nameToId, objectAll } from '$lib/util';

  type Props = {
    show: boolean,
    parent: ItemId,
    onclose: () => void,
  };

  const { show, parent, onclose }: Props = $props();

  let itemName = $state('');
  let newItemId = $state('');
  let itemDescription = $state('');
  let userModifiedId = $state(false);

  function resetAndClose() {
    itemName = '';
    itemDescription = '';
    newItemId = '';
    userModifiedId = false;
    onclose();
  }

  async function makeItem() {
    await api()
      .item(itemId.child(parent, newItemId))
      .info.post(itemName, itemDescription);
    // Close modal
    const target = itemId.child(parent, newItemId);
    resetAndClose();
    await goto(target);
  }

  const valuesOk = $state({
    name: false,
    id: true,
  });

  const canSubmit = $derived(objectAll(valuesOk));
</script>

<Modal {show} onclose={resetAndClose}>
  {#snippet header()}
    <h2>New item</h2>
  {/snippet}
  <p>Creating a new item as a child of '{parent}'.</p>
  <form onsubmit={makeItem}>
    <div class="form-grid">
      <label for="item-name">Item name</label>
      <TextInput
        id="item-name"
        placeholder={consts.APP_NAME}
        bind:value={itemName}
        required
        oninput={() => {
          // Whenever the user modifies the name, we should update the ID
          // to match, until the user modifies the ID themselves
          if (!userModifiedId) {
            newItemId = nameToId(itemName);
          }
        }}
        validator={name => validate.name.parse(name)}
        bind:valueOk={valuesOk.name}
      />
      <label for="item-id">Item ID</label>
      <TextInput
        placeholder={consts.APP_NAME}
        id="item-id"
        required
        bind:value={newItemId}
        oninput={() => {
          userModifiedId = true;
        }}
        validator={id => validate.idComponent.parse(id)}
        bind:valueOk={valuesOk.id}
      />
      <label for="item-description">Item description</label>
      <TextInput
        id="item-description"
        placeholder="A portfolio website and content management system"
        bind:value={itemDescription}
      />
    </div>
    <Button type="submit" disabled={!canSubmit}>Create</Button>
  </form>
</Modal>

<style>
  .form-grid {
    margin: 10px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    width: 100%;
  }

  label {
    display: flex;
    align-items: center;
  }
</style>
