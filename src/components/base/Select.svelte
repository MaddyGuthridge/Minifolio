<script lang="ts" generics="SelectionType">
  import type { Snippet } from 'svelte';

  type Props = {
    children: Snippet,
    /** ID of select control */
    // Is defined in `generics` attribute of `<script>` tag
    // eslint-disable-next-line no-undef
    value: SelectionType,
    /** Callback when selection has changed */
    onchange?: () => any,
    id?: string,
  };

  let {
    children,
    value = $bindable(),
    id = undefined,
    onchange = undefined,
  }: Props = $props();
</script>

<select bind:value {id} {onchange}>
  {@render children()}
</select>

<style>
  select {
    /* margin: 10px; */
    padding: 7px 10px;
    background-color: transparent;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: background-color 0.5s;
  }
  select:focus {
    border: 1px solid black;
    background-color: rgba(124, 124, 124, 0.25);
  }
  select:hover {
    cursor: pointer;
    background-color: rgba(124, 124, 124, 0.25);
  }
  select:active {
    background-color: rgba(255, 255, 255, 0.9);
    transition: background-color 0s;
  }
</style>
