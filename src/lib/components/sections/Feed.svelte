<script lang="ts">
  import { CopyButton } from '#lib/components/base/button/index.ts';
  import type { ItemId } from '#lib/itemId.ts';
  import type { FeedSection } from '#lib/server/data/item/section.ts';
  import { itemAtomUrl } from '#lib/urls.ts';

  type Props = {
    section: FeedSection,
    item: ItemId,
  };

  const { section, item }: Props = $props();

  function makeLink() {
    const location = document.location;
    return `${location.host}${itemAtomUrl(item)}`;
  }
</script>

<div class="section-main">
  <div class="display-outer">
    <i class="icon {section.icon ?? 'las la-rss'}"></i>
    <div>
      <h3>{section.label ?? 'Subscribe via RSS/Atom'}</h3>
    </div>
    <CopyButton text={makeLink} hint="Subscribe using your favourite RSS reader">Copy feed URL</CopyButton>
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  h3 {
    margin: 0;
  }

  .display-outer {
    text-decoration: none;
    color: black;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .icon {
    font-size: 5rem;
  }

  @media (prefers-color-scheme: dark) {
    .display-outer {
      color: white;
    }
  }
</style>
