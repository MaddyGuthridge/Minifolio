<script lang="ts">
  import EditableMarkdown from '$components/markdown';
  import api from '$endpoints';
  import { payload } from '$endpoints/fetch';
  import type { ItemId } from '$lib/itemId';

  type Props = {
    item: ItemId;
    filename: string;
    contents: string;
    editing: boolean;
    onsubmit: () => void;
  };

  const { item, filename, contents, editing, onsubmit }: Props = $props();

  async function commitChanges(newText: string) {
    await api().item(item).file(filename).put(payload.text(newText));
  }
</script>

<EditableMarkdown
  source={contents}
  {editing}
  onchange={commitChanges}
  {onsubmit}
/>
