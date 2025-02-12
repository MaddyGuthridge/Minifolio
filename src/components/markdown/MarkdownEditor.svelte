<script lang="ts">
  import 'highlight.js/styles/stackoverflow-light.css';
  import Markdown from './Markdown.svelte';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import { TextArea } from '$components/base';

  type Props = {
    source: string;
    onsubmit: () => void;
    onchange: (text: string) => Promise<void>;
  };

  let { source = $bindable(), onsubmit, onchange }: Props = $props();

  function handleKeypress(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') {
      onsubmit();
      updater.commit();
    }
  }

  const updater = new DelayedUpdater(onchange, consts.EDIT_COMMIT_HESITATION);
</script>

<div class="md-editor">
  <div class="md-input">
    <TextArea
      bind:value={source}
      onkeypress={handleKeypress}
      oninput={() => updater.update(source)}
      fontFamily="monospace"
      fontWeight="bold"
    ></TextArea>
  </div>
  <span class="md-preview">
    <Markdown {source} />
  </span>
</div>

<style>
  .md-editor {
    display: flex;
    gap: 20px;
  }

  /* Display editor in columns on small screens */
  @media screen and (max-width: 600px) {
    .md-editor {
      flex-direction: column;
    }
  }

  .md-input {
    flex: 1;
  }

  .md-preview {
    flex: 1;
  }
</style>
