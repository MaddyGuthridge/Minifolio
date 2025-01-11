<script lang="ts">
  import api from '$endpoints';
  import type { ItemId } from '$lib/itemId';

  type Props = {
    /** ItemId to which the files belong */
    itemId: ItemId;
    /** Array of files belonging to the item */
    files: string[];
  };

  let { itemId, files = $bindable() }: Props = $props();

  /** Delete the given item */
  async function deleteFile(filename: string) {
    await api().item(itemId).file(filename).delete();
    files = files.filter((f) => f !== filename);
  }

  let filesToUpload: FileList | undefined = $state();
  let uploadForm: HTMLFormElement;
  async function uploadFile() {
    if (!filesToUpload) return;
    for (const file of filesToUpload) {
      await api()
        .item(itemId)
        .file(file.name)
        .post(file)
        .then(() => files.push(file.name));
    }
    // Clear form
    uploadForm.reset();
  }
</script>

<table>
  <thead>
    <tr>
      <th>Filename</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each files as file}
      <tr>
        <td>{file}</td>
        <td>
          <button onclick={() => deleteFile(file)}>Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
<form
  onsubmit={(e) => {
    e.preventDefault();
    void uploadFile();
  }}
  bind:this={uploadForm}
>
  <label for="upload">Upload files</label>
  <input
    type="file"
    name="file"
    id="upload"
    bind:files={filesToUpload}
    required
  />
  <input type="submit" value="Upload" />
</form>
