<script lang="ts">
  import { type Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { colord } from 'colord';
  import { withLightness } from '$lib/color';

  type Props = {
    /** Link behavior options */
    link?: { url: string, newTab: boolean },
    /** Hex color to use on the card */
    color: string,
    /** Body content to place in the card */
    children: Snippet,
    /** Callback for when the element is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void,
  };

  const { link, color, children, onclick }: Props = $props();

  const baseColorLight = $derived(withLightness(colord(color), 80).toHex());
  const baseColorDark = $derived(withLightness(colord(color), 30).toHex());
  const hoverColorLight = $derived(withLightness(colord(color), 65).toHex());
  const hoverColorDark = $derived(withLightness(colord(color), 40).toHex());

  const linkHref = $derived(link ? link.url : undefined);
  const linkNewTab = $derived(link?.newTab ? '_blank' : undefined);
</script>

<!--
@component

A generic card element.

Children are rendered on a colored card with rounded corners.
-->

{#snippet content()}
  <div
    class="card"
    style:--color-light={baseColorLight}
    style:--color-dark={baseColorDark}
    style:--hover-color-light={hoverColorLight}
    style:--hover-color-dark={hoverColorDark}
  >
    {@render children()}
  </div>
{/snippet}

<!--
  HACK: Workaround for https://github.com/sveltejs/kit/issues/11057
  Very yucky, but I'll have to live with it since technically this is the only way to get valid HTML
  :(
-->
{#if link}
  <a
    href={linkHref}
    onclick={async (e) => {
      if (link) {
        await goto(link.url);
      } else if (onclick) {
        onclick(e);
      }
    }}
    target={linkNewTab}
  >
    {@render content()}
  </a>
{:else}
  {@render content()}
{/if}

<style>
  a {
    text-decoration: none;
  }

  .card {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin: 10px;
    border-radius: 15px;
    box-shadow: 5px 5px 15px rgba(61, 61, 61, 0.329);
    height: 90%;
    transition:
      background-color 0.5s,
      box-shadow 0.5s;
  }
  .card:hover {
    /* Don't scale cards since that makes the text render weirdly on Firefox */
    /* transform: scale(1.01); */
    box-shadow:
      /* Default shadow */
      5px 5px 10px rgba(61, 61, 61, 0.178),
      /* Glow */ 0 0 20px var(--color);
  }
  @media only screen and (max-width: 600px) {
    .card {
      max-width: 100%;
      padding: 10px 15px;
    }
  }

  @media (prefers-color-scheme: light) {
    a {
      color: black;
    }
    .card {
      background-color: var(--color-light);
    }
    .card:hover {
      background-color: var(--hover-color-light);
    }
  }
  @media (prefers-color-scheme: dark) {
    a {
      color: white;
    }
    .card {
      background-color: var(--color-dark);
    }
    .card:hover {
      background-color: var(--hover-color-dark);
    }
  }
</style>
