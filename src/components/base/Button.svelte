<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet;
    hint?: string;
    type?: 'submit';
    /** Whether button is disabled */
    disabled?: boolean;
    /** onclick callback */
    onclick?: () => any;
  };

  const { children, hint, type, disabled, onclick }: Props = $props();
</script>

{#if hint}
  <button
    {onclick}
    {type}
    {disabled}
    use:tooltip={{ content: hint }}
    aria-label={hint}
  >
    {@render children()}
  </button>
{:else}
  <button {onclick} {type}>
    {@render children()}
  </button>
{/if}

<style>
  button {
    /*
      Reset button properties
      https://stackoverflow.com/a/54101412/6335363
    */
    all: unset;
    /* margin: 10px; */
    padding: 5px 10px;
    background-color: transparent;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: background-color 0.5s;
  }
  button:focus {
    border: 1px solid black;
    background-color: rgba(124, 124, 124, 0.25);
  }
  button:hover {
    cursor: pointer;
    background-color: rgba(124, 124, 124, 0.25);
  }
  button:active {
    background-color: rgba(255, 255, 255, 0.9);
    transition: background-color 0s;
  }
</style>
