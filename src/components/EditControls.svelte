<script lang="ts">
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
      <button onclick={onfinish}>Done</button>
    {:else}
      <button onclick={onbegin}>Edit</button>
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
  button {
    height: 2rem;
    background-color: rgb(221, 221, 221);
    border: none;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    align-items: center;
  }
  button:hover {
    background-color: rgb(210, 210, 210);
    cursor: pointer;
  }
</style>
