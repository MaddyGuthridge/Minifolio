<script lang="ts">
  import { Button } from '$components/base';
  import api from '$endpoints';
  import type { ItemId } from '$lib/itemId';
  import ItemFile from './ItemFile.svelte';

  type Props = {
    /** ItemId to which the files belong */
    itemId: ItemId;
    /** Array of files belonging to the item */
    files: string[];
  };

  let { itemId, files = $bindable() }: Props = $props();

  // File upload
  // ==================================================

  /** Selected files to upload */
  let filesToUpload: FileList | undefined = $state();
  /** Form where files are uploaded*/
  let uploadForm: HTMLFormElement;
  /** Button used to choose files */
  let fileSelectButton: HTMLInputElement;
  /** Upload files from the form */
  async function uploadFiles() {
    if (!filesToUpload) return;
    await Promise.all(
      Array.from(filesToUpload).map(async (file) => {
        await api().item(itemId).file(file.name).post(file);
        files.push(file.name);
      }),
    );
    // Clear form
    uploadForm.reset();
  }

  $effect(() => {
    if (filesToUpload?.length) {
      void uploadFiles();
    }
  });
</script>

<table>
  <thead>
    <tr>
      <th>Filename</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each files as filename}
      <ItemFile {itemId} {filename} bind:files />
    {/each}
  </tbody>
</table>
<form bind:this={uploadForm}>
  <label for="upload">
    <Button onclick={() => fileSelectButton.click()}>Upload Files</Button>
  </label>
  <input
    type="file"
    name="file"
    id="upload"
    bind:files={filesToUpload}
    bind:this={fileSelectButton}
    style="display: none"
    multiple
    required
  />
</form>

<style>
  table {
    width: 100%;
  }
</style>
