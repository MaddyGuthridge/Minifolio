<script lang="ts">
  import Markdown from './Markdown.svelte';
  import consts from '#lib/consts.ts';
  import DelayedUpdater from '#lib/delayedUpdate.ts';
  import { TextArea } from '#lib/components/base/index.ts';

  type Props = {
    source: string,
    article: boolean,
    onsubmit: () => void,
    onchange: (text: string) => Promise<void>,
  };

  let {
    source = $bindable(),
    article,
    onsubmit,
    onchange,
  }: Props = $props();

  function handleKeypress(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'Enter') {
      onsubmit();
      updater.commit();
    }
  }

  // TODO: Fix yucky workaround
  // svelte-ignore state_referenced_locally
  const updater = new DelayedUpdater(onchange, consts.EDIT_COMMIT_HESITATION);
</script>

<div class="outer">
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
    <div class="md-preview">
      <Markdown {source} {article} />
    </div>
  </div>
</div>

<style>
  .outer {
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }

  .md-editor {
    display: flex;
    gap: 20px;
    width: 100%;
  }

  /* Display editor in columns on small screens */
  @media screen and (max-width: 1000px) {
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
