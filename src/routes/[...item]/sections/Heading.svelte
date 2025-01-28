<script lang="ts">
  import type { HeadingSection } from '$lib/server/data/item/section';

  type Props = {
    section: HeadingSection;
    editing: boolean;
    onchange: () => void;
  };

  const { section = $bindable(), editing, onchange }: Props = $props();
</script>

{#if !editing}
  <h2>{section.heading}</h2>
  <hr />
{:else}
  <input
    type="text"
    bind:value={section.heading}
    oninput={onchange}
    placeholder="Heading contents"
  />
{/if}

<style>
  h2 {
    font-size: 3rem;
    margin: 10px;
  }
  input {
    font-size: 3rem;
  }
</style>
