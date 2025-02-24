<script lang="ts">
  import { TextArea } from '$components/base';
  import { CodeBlock } from '$components/markdown';
  import { FilePicker } from '$components/pickers';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import itemId from '$lib/itemId';
  import type { ConfigJson } from '$lib/server/data/config';
  import { itemFileUrl } from '$lib/urls';

  type Props = {
    configJson: ConfigJson;
    imageFiles: string[];
  };

  const { configJson, imageFiles }: Props = $props();

  // Yucky work-around to make values update
  const config = $state(configJson);

  const updater = new DelayedUpdater(
    async (value: ConfigJson) => api().config.put(value),
    consts.EDIT_COMMIT_HESITATION,
  );
</script>

<div>
  <h2>Public settings</h2>
  <form>
    <div>
      <label for="site-icon"><h3>Site icon</h3></label>
      <FilePicker
        bind:selected={config.siteIcon}
        files={imageFiles}
        onchange={() => updater.update(config)}
      />
      {#if config.siteIcon}
        <p>
          Note: the image may be squashed/stretched by the browser when
          displayed in the address bar.
        </p>
        <div class="site-icon-preview">
          <img
            src={itemFileUrl(itemId.ROOT, config.siteIcon)}
            alt={'Preview of site icon'}
          />
        </div>
      {/if}
    </div>

    <label for="rel-me"><h3>Verification links</h3></label>
    <TextArea
      bind:value={() => config.verification.relMe.join('\n'),
      (relMe: string) => (config.verification.relMe = relMe.trim().split('\n'))}
      oninput={() => updater.update(config)}
    />
    <p>Place each URL on a separate line.</p>
    <p>The links will be included as:</p>
    <CodeBlock
      language="html"
      code={config.verification.relMe
        .map((me) => `<link rel="me" href="${me}" />`)
        .join('\n')}
    />
  </form>
</div>

<style>
  .site-icon-preview {
    aspect-ratio: 1 / 1;
    max-width: 30%;
    margin: 10px;
  }
  .site-icon-preview > img {
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
</style>
