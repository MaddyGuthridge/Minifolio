<script lang="ts">
  import { TextArea, TextInput } from '$components/base';
  import type { ItemData, ItemInfo } from '$lib/server/data/item';

  type Props = {
    item: ItemData,
    onchange: (info: ItemInfo) => void,
  };

  let { item = $bindable(), onchange }: Props = $props();

  // FIXME: Make this only happen when committing to the server to prevent annoying bugs when
  // performing certain edits
  function commitChanges() {
    const info = item.info;
    if (info.seo.description === '') {
      info.seo.description = null;
    }
    // info.seo.keywords = item.info.seo.keywords.filter(kw => kw.trim().length);
    onchange(info);
  }
</script>

<h2>SEO options</h2>
<h3>Page description</h3>
<p>The description of the page, shown to search engines.</p>
<TextInput
  placeholder="A concise description."
  bind:value={item.info.seo.description}
  oninput={commitChanges}
/>

<h3>Page keywords</h3>
<p>
  The page's keywords, shown to search engines. Keywords of parent items are
  included automatically.
</p>
<p>Place each keyword on a new line.</p>
<TextArea
  placeholder="Keywords for this page"
  bind:value={() => item.info.seo.keywords.join('\n'), (kws) => {
    item.info.seo.keywords = kws.split('\n');
  }}
  oninput={commitChanges}
/>
