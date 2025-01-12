<script lang="ts">
  // It would be nice if there was a way to make `selected: string` if `allowNoSelection` is
  // `false`, but annoyingly https://stackoverflow.com/a/52318137/6335363 doesn't seem to work
  // properly in Svelte
  type Props = {
    /** Files to pick from */
    files: string[];
    /** Selected file (bind to this) */
    selected: string | null;
    /** Callback for when a value is changed */
    onchange: () => any;
    /** Don't allow a blank selection */
    forceSelection?: boolean;
  };

  let {
    files,
    selected = $bindable(),
    onchange,
    forceSelection = false,
  }: Props = $props();
</script>

<select bind:value={selected} {onchange}>
  {#if !forceSelection}
    <option value={null}>- None -</option>
  {/if}
  {#each files as file}
    <option value={file}>{file}</option>
  {/each}
</select>
