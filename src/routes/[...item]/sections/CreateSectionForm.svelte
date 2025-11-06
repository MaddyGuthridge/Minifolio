<script lang="ts">
  import { Button, Select } from '$components/base';
  import itemId from '$lib/itemId';
  import type { ItemSection, SectionType } from '$lib/server/data/item/section';
  import { capitalize } from '$lib/util';

  type Props = {
    oncreate: (info: ItemSection) => void,
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
      icon: null,
      label: null,
      url: 'https://example.com',
    },
    links: {
      type: 'links',
      label: 'See also',
      style: 'chip',
      items: [],
    },
    backlinks: {
      type: 'backlinks',
      label: 'See also',
      style: 'chip',
      parentItem: itemId.ROOT,
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
    download: {
      type: 'download',
      label: null,
      file: '',
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
  <Select bind:value={newSectionType}>
    {#each Object.keys(defaultSections) as type (type)}
      <option value={type}>{capitalize(type)}</option>
    {/each}
  </Select>
  <Button type="submit">Create</Button>
</form>

<style>
  form {
    margin-bottom: 20px;
  }
</style>
