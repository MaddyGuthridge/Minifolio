<script lang="ts">
  import { tooltip } from '$lib/ui';
  import type { Snippet } from 'svelte';

  export type ButtonProps = {
    /** Display mode for button (controls background color) */
    mode?: 'default' | 'warning' | 'confirm';
    /** Hint for button (controls tooltip and aria-label) */
    hint?: string;
    /** Whether the hint tool-tip should be interactive */
    hintInteractive?: boolean;

    // Standard button props
    children: Snippet;
    id?: string;
    type?: 'submit';
    /** Whether button is disabled */
    disabled?: boolean;
    /** onclick callback */
    onclick?: () => any;
  };

  const {
    children,
    hint,
    hintInteractive = false,
    type,
    id,
    disabled,
    onclick,
    mode = 'default',
  }: ButtonProps = $props();

  const { color, hoverColor, clickColor } = $derived.by(() => {
    if (mode === 'warning') {
      return {
        color: '#FF808040',
        hoverColor: '#FF8080FF',
        clickColor: '#FF2222FF',
      };
    }
    if (mode === 'confirm') {
      return {
        color: '#8080FF40',
        hoverColor: '#8080FFFF',
        clickColor: '#2222FFFF',
      };
    }
    // mode === 'default'
    return {
      color: '#00000000',
      hoverColor: '#80808040',
      clickColor: '#FFFFFFFF',
    };
  });
</script>

{#if hint}
  <!--
    Need to use:tooltip on inner div, as Tippy can struggle with interactive elements
    sometimes:
    * https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity
    * https://github.com/atomiks/tippyjs/issues/104
  -->
  <span>
    <span use:tooltip={{ content: hint, interactive: hintInteractive }}>
      <button
        {onclick}
        {type}
        {disabled}
        {id}
        aria-label={hint}
        style:--color={color}
        style:--hoverColor={hoverColor}
        style:--clickColor={clickColor}
      >
        {@render children()}
      </button>
    </span>
  </span>
{:else}
  <button
    {onclick}
    {type}
    {disabled}
    {id}
    style:--color={color}
    style:--hoverColor={hoverColor}
    style:--clickColor={clickColor}
  >
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
    background-color: var(--color);
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: background-color 0.5s;
  }
  button:focus {
    border: 1px solid black;
    background-color: var(--hoverColor);
  }
  button:hover {
    cursor: pointer;
    background-color: var(--hoverColor);
  }
  button:active {
    background-color: var(--clickColor);
    transition: background-color 0s;
  }
  button:disabled {
    color: gray;
  }
  button:disabled:hover {
    cursor: default;
    background-color: var(--color);
  }
</style>
