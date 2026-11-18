<script lang="ts">
  import { Separator } from '#lib/components/index.ts';
  import { TextInput } from '#lib/components/base/index.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import type { FeedSection } from '#lib/server/data/item/section.ts';
  import Feed from '#lib/components/sections/Feed.svelte';

  type Props = {
    section: FeedSection,
    item: ItemId,
    onchange: () => void,
  };

  let { section = $bindable(), item, onchange }: Props = $props();
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
    </div>
    <Separator />
    <Feed {section} {item} />
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
