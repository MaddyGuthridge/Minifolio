<script lang="ts">
  import itemId, { type ItemId } from '$lib/itemId';
  import type { ItemData } from '$lib/server/data/item/item';
  import { getDescendant } from '$lib/itemData';
  import consts from '$lib/consts';
  import { onMount } from 'svelte';
  import ControlButtons from './ControlButtons.svelte';

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

  const {
    path,
    data,
    loggedIn,
    editable = false,
    editing = false,
    onEditBegin,
    onEditFinish,
    lastItem,
  }: Props = $props();

  function itemIdToPath(id: ItemId, lastItem: ItemData): NavbarPath {
    if (id === '/') {
      return [
        {
          url: '',
          txt: lastItem.info.name || consts.APP_NAME,
        },
      ];
    }
    const tailPath = itemId
      .components(id)
      .slice(0, -1)
      .map((p, i) => {
        const descendant = getDescendant(data, itemId.slice(id, 0, i + 1)).info;
        return {
          url: p,
          txt:
            i === id.length - 1
              ? descendant.name
              : (descendant.shortName ?? descendant.name),
        };
      });
    return [
      {
        url: '',
        txt: data.info.shortName ?? data.info.name,
      },
      ...tailPath,
      {
        url: itemId.at(id, -1),
        txt: lastItem.info.name,
      },
    ];
  }

  const overallPath: NavbarPath = $derived.by(() => {
    if (typeof path === 'string') {
      // Path is ItemId
      return itemIdToPath(path, lastItem!);
    } else {
      return [{ url: '', txt: data.info.shortName ?? data.info.name }, ...path];
    }
  });

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

  // Update scroll position on mount so that we don't get weird visual artifacts
  // if the page loads half-way down for some reason
  onMount(onscroll);
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

  <div style:grid-area="control-buttons" class="control-buttons">
    <ControlButtons
      {loggedIn}
      {editable}
      {editing}
      {onEditBegin}
      {onEditFinish}
    />
  </div>
</nav>

<style>
  nav {
    width: 100%;
    margin: 0px;
    margin-bottom: 20px;
    top: 0;
    padding: 5px 10px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-areas: 'navigator empty control-buttons';
    backdrop-filter: blur(0px) brightness(100%);
    transition: all 0.5s;
    /* Temporary fix before I make a proper mobile interface */
    overflow-x: hidden;
  }

  .control-buttons {
    height: 100%;
    display: flex;
    justify-content: center;
  }

  /* If the device is wide enough, make the navbar sticky */
  @media (min-width: 50rem) {
    nav {
      position: sticky;
    }

    :global html[data-scroll='page'] nav {
      box-shadow:
        -5px 0px 10px rgba(0, 0, 0, 0.5),
        5px 0px 10px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px) brightness(110%);
    }
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
  }

  @media (width < 30rem) {
    h1 {
      font-size: 2rem;
    }
  }
  @media (30rem <= width < 50rem) {
    h1 {
      font-size: 2.5rem;
    }
  }
  @media (50rem <= width) {
    h1 {
      font-size: 3rem;
    }
  }
</style>

<!-- If JS is disabled, don't make the navbar sticky (it'll just get in the way of feed readers) -->
<noscript>
  <style>
    nav {
      position: relative !important;
    }

    .control-buttons {
      display: none !important;
    }
  </style>
</noscript>
