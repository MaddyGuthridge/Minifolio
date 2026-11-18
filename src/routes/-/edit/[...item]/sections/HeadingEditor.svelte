<script lang="ts">
  import { TextInput } from '#lib/components/base/index.ts';
  import type { HeadingSection } from '#lib/server/data/item/section.ts';

  type Props = {
    section: HeadingSection,
    onchange: () => void,
  };

  const { section = $bindable(), onchange }: Props = $props();
</script>

<TextInput
  bind:value={section.heading}
  oninput={onchange}
  placeholder="Heading contents"
  size={3}
/>
