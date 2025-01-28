<script lang="ts">
  import { Button } from './base';

  type Props = {
    /** Whether edit mode is currently enabled */
    editing: boolean;
    /** Whether the user is currently logged in */
    loggedIn: boolean;
    /** Called when editing begins */
    onbegin: () => void;
    /** Called when editing is finished. */
    onfinish: () => void;
  };

  let { editing, loggedIn, onbegin, onfinish }: Props = $props();
</script>

{#if loggedIn}
  <div class="edit-buttons">
    {#if editing}
      <Button onclick={onfinish}>Done</Button>
    {:else}
      <Button onclick={onbegin}>Edit</Button>
    {/if}
  </div>
{/if}

<style>
  .edit-buttons {
    display: flex;
    gap: 10px;
    width: 90%;
    justify-content: right;
  }
</style>
