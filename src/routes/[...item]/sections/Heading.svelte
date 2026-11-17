<script lang="ts">
  import { TextInput } from '#lib/components/base/index.ts';
  import type { HeadingSection } from '#lib/server/data/item/section.ts';

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
