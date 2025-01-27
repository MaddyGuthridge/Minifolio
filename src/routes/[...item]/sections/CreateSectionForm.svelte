<script lang="ts">
  import type { ItemSection, SectionType } from '$lib/server/data/item/section';

  type Props = {
    oncreate: (info: ItemSection) => void;
  };

  const { oncreate }: Props = $props();

  let newSectionType: SectionType = $state('heading');

  /** Default values for new sections */
  const defaultSections: Record<SectionType, ItemSection> = {
    heading: {
      type: 'heading',
      heading: 'Heading',
    },
    site: {
      type: 'site',
      label: null,
      url: 'https://example.com',
    },
    docs: {
      type: 'docs',
      label: null,
      url: 'https://example.com',
    },
    links: {
      type: 'links',
      label: 'See also',
      style: 'chip',
      items: [],
    },
    package: {
      type: 'package',
      label: null,
      info: {
        provider: 'custom',
        command: '',
        icon: '',
        providerName: '',
        url: '',
      },
    },
    repo: {
      type: 'repo',
      label: null,
      info: {
        provider: 'custom',
        title: '',
        subtitle: '',
        url: '',
        icon: '',
      },
    },
  } as const;
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    // Clone item so that it can't be inadvertently edited elsewhere
    oncreate(structuredClone(defaultSections[newSectionType]));
  }}
>
  <b>Add new section:</b>
  <select bind:value={newSectionType}>
    {#each Object.keys(defaultSections) as type}
      <option value={type}>{type}</option>
    {/each}
  </select>
  <input type="submit" value="Create" />
</form>

<style>
  form {
    margin-bottom: 20px;
  }
</style>
