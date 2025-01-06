<script lang="ts">
  import 'highlight.js/styles/stackoverflow-light.css';
  import Markdown from './Markdown.svelte';
  import consts from '$lib/consts';

  type Props = {
    source: string;
    onsubmit: () => void;
    onchange: (text: string) => Promise<void>;
  };

  let { source = $bindable(), onsubmit, onchange }: Props = $props();

  function handleKeypress(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') {
      onsubmit();
    }
  }

  let changeTimer: ReturnType<typeof setTimeout> | undefined;

  /** Called when the change timer fires */
  function changeTimerCallback() {
    void onchange(source);
    changeTimer = undefined;
  }
</script>

<div class="md-editor">
  <textarea
    class="md-input"
    bind:value={source}
    onkeypress={handleKeypress}
    oninput={() => {
      if (changeTimer) {
        clearTimeout(changeTimer);
      }
      changeTimer = setTimeout(
        changeTimerCallback,
        consts.EDIT_COMMIT_HESITATION,
      );
    }}
  ></textarea>
  <span class="md-preview">
    <Markdown {source} />
  </span>
</div>

<style>
  .md-editor {
    display: flex;
    gap: 10px;
  }

  .md-input {
    flex: 1;
    font-family: monospace;
    padding: 10px;
    border: solid grey 1px;
    border-radius: 5px;
    width: 100%;
  }

  .md-preview {
    flex: 1;
  }
</style>
