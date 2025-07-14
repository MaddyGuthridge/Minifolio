<script lang="ts">
  import { TextInput } from '$components/base';
  import type { HeadingSection } from '$lib/server/data/item/section';

  type Props = {
    section: HeadingSection,
    editing: boolean,
    onchange: () => void,
  };

  const { section = $bindable(), editing, onchange }: Props = $props();
</script>

{#if !editing}
  <h2>{section.heading}</h2>
  <hr />
{:else}
  <TextInput
    bind:value={section.heading}
    oninput={onchange}
    placeholder="Heading contents"
    size={3}
  />
{/if}

<style>
  h2 {
    font-size: 3rem;
    margin: 10px;
  }
</style>
