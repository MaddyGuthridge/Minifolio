<script lang="ts">
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';
  import Button from '$components/base/button/Button.svelte';
  import Separator from '$components/Separator.svelte';
  import api from '$endpoints';

  type Props = {
    /** Whether the user is logged in. Set to undefined if auth is disabled */
    loggedIn: boolean | undefined;
    editable?: boolean;
    /** Whether edit mode is active */
    editing?: boolean;
    /** Called when beginning edits */
    onEditBegin?: () => void;
    /** Called when finishing edits */
    onEditFinish?: () => void;
  };

  const {
    loggedIn,
    editable = false,
    editing = false,
    onEditBegin,
    onEditFinish,
  }: Props = $props();

  /** Log out, then reload the page */
  async function logOut() {
    await api().admin.auth.logout();
    location.reload();
  }

  /**
   * Go to the login page, with the from parameter determining the origin page.
   */
  async function gotoLogin() {
    await goto(`/admin/login?from=${window.location.pathname}`);
  }

  /** Clear all data, and take the user to the firstrun page */
  async function clear() {
    await api().debug.clear();
    await goto('/admin/firstrun/account');
  }

  function editButtonClick() {
    if (editing) {
      onEditFinish?.();
    } else {
      onEditBegin?.();
    }
  }
</script>

<span id="control-buttons">
  {#if loggedIn}
    {#if editable}
      <!-- Use the one button so that animations persist between states -->
      <Button onclick={editButtonClick} mode={editing ? 'confirm' : 'default'}>
        {editing ? 'Finish editing' : 'Edit'}
      </Button>
    {/if}
    <Button onclick={() => goto('/admin')}>Admin</Button>
    <Button onclick={logOut}>Log out</Button>
  {:else if loggedIn !== undefined}
    <!-- Only include a login button if logging in is enabled -->
    <Button onclick={gotoLogin}>Log in</Button>
  {/if}
  <!-- About button navigates to about page -->
  <Button onclick={() => goto('/about')}>About</Button>
  <!-- In dev mode, add a quick shortcut to delete everything -->
  {#if dev}
    <div class="sep">
      <Separator />
    </div>
    <Button onclick={clear} mode="warning">Clear data</Button>
  {/if}
</span>

<!-- TODO: Make control buttons responsive, so they change to a curtain menu on mobile devices -->

<style>
  #control-buttons {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    grid-area: control-buttons;
    margin-right: 20px;
  }

  /* When screen is narrow, make buttons vertical and hide the separator */
  @media (width < 50rem) {
    #control-buttons {
      flex-direction: column;
    }

    .sep {
      display: none;
    }
  }
</style>
