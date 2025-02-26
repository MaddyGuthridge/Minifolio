<script lang="ts">
  import { Button } from '$components/base';
  import api from '$endpoints';
  import { payload } from '$endpoints/fetch';
  import type { ItemId } from '$lib/itemId';
  import { reportError } from '$lib/ui/toast';

  type Props = {
    /** ItemId to which file belongs */
    itemId: ItemId;
    /** File name */
    filename: string;
    /** Full list of files (bind to this so that updates are correctly processed) */
    files: string[];
  };

  let { itemId, filename, files = $bindable() }: Props = $props();

  // Delete file
  // ==================================================

  /** Delete the file */
  async function deleteFile() {
    await reportError(async () => {
      await api().item(itemId).file(filename).delete();
      files = files.filter((f) => f !== filename);
    }, 'Unable to delete file file');
  }

  // Replace existing file
  // ==================================================

  /** Selected files to replace it with */
  let filesToUpload: FileList | undefined = $state();
  /** Form where replacement is chosen */
  let replaceForm: HTMLFormElement;
  /** Button used to choose replacement file */
  let fileSelectButton: HTMLInputElement;

  /** Update the given file */
  async function updateFile(file: File) {
    await reportError(async () => {
      await api().item(itemId).file(filename).put(payload.file(file));
      replaceForm?.reset();
    }, 'Error updating file');
  }

  // React to changes in selected files, uploading files when they are selected
  $effect(() => {
    if (filesToUpload?.length) {
      void updateFile(filesToUpload[0]);
    }
  });
</script>

<tr>
  <td>{filename}</td>
  <td>
    <span class="horizontal">
      <span class="grow"></span>
      <form bind:this={replaceForm}>
        <!-- Change text on <input type="file": https://stackoverflow.com/a/33822113/6335363 -->
        <label for="upload-{filename}">
          <Button onclick={() => fileSelectButton.click()}>Replace</Button>
        </label>
        <input
          type="file"
          name="upload-{filename}"
          id="upload-{filename}"
          accept={/**
           * Only allow matching file extensions
           * TODO: Change this to use mime-types to make it more permissive of extension
           * differences, eg .jpg vs .jpeg
           */
          `.${filename.split('.').pop()}`}
          style="display: none"
          bind:files={filesToUpload}
          bind:this={fileSelectButton}
          required
        />
      </form>
      <Button onclick={deleteFile}>Delete</Button>
    </span>
  </td>
</tr>

<style>
  .horizontal {
    display: flex;
    gap: 10px;
  }
  .grow {
    flex-grow: 1;
  }
</style>
