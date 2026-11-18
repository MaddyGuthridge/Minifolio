<script lang="ts">
  import { Separator } from '#lib/components/index.ts';
  import { TextInput } from '#lib/components/base/index.ts';
  import type { SiteSection } from '#lib/server/data/item/section.ts';
  import Site from '#lib/components/sections/Site.svelte';

  type Props = {
    section: SiteSection,
    onchange: () => void,
  };

  let { section = $bindable(), onchange }: Props = $props();
</script>

<div class="section-main">
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="site-label-text">Label text</label>
      <TextInput
        id="site-label-text"
        bind:value={section.label}
        oninput={onchange}
        placeholder="Label text"
      />
      <label for="site-icon">
        <a href="https://icons8.com/line-awesome" target="_blank">Icon</a>
      </label>
      <TextInput
        id="site-icon"
        bind:value={section.icon}
        oninput={onchange}
        placeholder="las la-globe"
      />
      <label for="site-url">Website URL</label>
      <TextInput
        id="site-url"
        bind:value={section.url}
        oninput={onchange}
        placeholder="Website URL"
        required
      />
    </div>
    <Separator />
    <Site {section} link={false} />
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  .edit-outer {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .edit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  label {
    display: flex;
    align-items: center;
  }
</style>
