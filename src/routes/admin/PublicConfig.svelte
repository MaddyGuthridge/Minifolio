<script lang="ts">
  import { TextArea } from '$components/base';
  import { CodeBlock } from '$components/markdown';
  import { FilePicker } from '$components/pickers';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import type { ConfigJson } from '$lib/server/data/config';

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
    </div>

    <label for="rel-me"><h3>Verification links</h3></label>
    <TextArea
      bind:value={() => config.relMe.join('\n'),
      (relMe: string) => (config.relMe = relMe.trim().split('\n'))}
      oninput={() => updater.update(config)}
    />
    <p>Place each URL on a separate line.</p>
    <p>The links will be included as:</p>
    <CodeBlock
      language="html"
      code={config.relMe
        .map((me) => `<link rel="me" href="${me}" />`)
        .join('\n')}
    />
  </form>
</div>
