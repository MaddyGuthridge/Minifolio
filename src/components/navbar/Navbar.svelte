<script lang="ts">
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';
  import api from '$endpoints';
  import Separator from '$components/Separator.svelte';
  import type { ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item/item';
  import { getDescendant } from '$lib/itemData';
  import consts from '$lib/consts';
  import { Button } from '$components/base';

  type NavbarPath = { url: string; txt: string }[];

  type PropsItem = {
    /** ItemId */
    path: ItemId;
    /** Info for the last item, passed separately to allow for reactivity when editing */
    lastItem: ItemData;
  };

  type PropsOther = {
    /** Path on the navbar */
    path: NavbarPath;
    lastItem?: undefined;
  };

  type Props = {
    /** Full portfolio data */
    data: ItemData;
    /** Whether the user is logged in. Set to undefined if auth is disabled */
    loggedIn: boolean | undefined;
    editable?: boolean;
    /** Whether edit mode is active */
    editing?: boolean;
    /** Called when beginning edits */
    onEditBegin?: () => void;
    /** Called when finishing edits */
    onEditFinish?: () => void;
  } & (PropsItem | PropsOther);

  let {
    path,
    data,
    loggedIn,
    editable = false,
    editing = false,
    onEditBegin,
    onEditFinish,
    lastItem,
  }: Props = $props();

  function itemIdToPath(itemId: ItemId, lastItem: ItemData): NavbarPath {
    if (itemId.length === 0) {
      return [
        {
          url: '',
          txt: lastItem.info.name || consts.APP_NAME,
        },
      ];
    }
    const tailPath = itemId.slice(0, -1).map((p, i) => {
      const descendant = getDescendant(data, itemId.slice(0, i)).info;
      return {
        url: p,
        txt:
          i === itemId.length - 1
            ? descendant.name
            : (descendant.shortName ?? descendant.name),
      };
    });
    return [
      {
        url: '',
        txt: itemId.length
          ? (data.info.shortName ?? data.info.name)
          : data.info.name,
      },
      ...tailPath,
      {
        url: itemId.at(-1)!,
        txt: lastItem.info.name || 'No name',
      },
    ];
  }

  let overallPath: NavbarPath = $derived.by(() => {
    if (path.length === 0 || typeof path[0] === 'string') {
      // Path is ItemId
      return itemIdToPath(path as ItemId, lastItem!);
    } else {
      return [
        { url: '', txt: data.info.shortName ?? data.info.name },
        ...(path as NavbarPath),
      ];
    }
  });

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

  // This function needs to accept `path` as an input, otherwise the links
  // stop being reactive due to caching or something
  function pathTo(path: NavbarPath, i: number) {
    return path
      .slice(1, i + 1)
      .map((p) => p.url)
      .join('/');
  }

  /** Set document data when scroll isn't at top of page */
  function onscroll() {
    // https://css-tricks.com/styling-based-on-scroll-position/
    document.documentElement.dataset.scroll =
      window.scrollY < 20 ? 'top' : 'page';
  }

  function editButtonClick() {
    if (editing) {
      onEditFinish?.();
    } else {
      onEditBegin?.();
    }
  }
</script>

<svelte:window {onscroll} />

<nav>
  <span style:grid-area="navigator">
    <h1>
      {#each overallPath.slice(0, -1) as p, i}
        <a href="/{pathTo(overallPath, i)}">{p.txt}</a>
        {'/ '}
      {/each}
      {overallPath[overallPath.length - 1].txt}
    </h1>
  </span>

  <!-- Control buttons -->
  <span id="control-buttons">
    {#if loggedIn}
      {#if editable}
        <!-- Use the one button so that animations persist between states -->
        <Button
          onclick={editButtonClick}
          mode={editing ? 'confirm' : 'default'}
        >
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
      <Separator />
      <Button onclick={clear} mode="warning">Clear data</Button>
    {/if}
  </span>
</nav>

<style>
  nav {
    position: sticky;
    margin: 0px;
    margin-bottom: 20px;
    top: 0;
    padding: 5px 10px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-areas: 'navigator empty control-buttons';
    backdrop-filter: blur(0px) brightness(100%);
    transition: backdrop-filter 0.5s;
  }

  :global html:not([data-scroll='top']) nav {
    box-shadow:
      -5px 0px 10px rgba(0, 0, 0, 0.5),
      5px 0px 10px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px) brightness(110%);
  }

  a {
    color: black;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }

  h1 {
    margin: 0px;
    font-size: 3em;
  }

  #control-buttons {
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: center;
    grid-area: control-buttons;
    margin-right: 20px;
  }
</style>
