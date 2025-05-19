<script lang="ts">
  import { TextArea, TextInput } from '$components/base';
  import { CodeBlock } from '$components/markdown';
  import { FilePicker } from '$components/pickers';
  import api from '$endpoints';
  import consts from '$lib/consts';
  import DelayedUpdater from '$lib/delayedUpdate';
  import itemId from '$lib/itemId';
  import type { ConfigJson } from '$lib/server/data/config';
  import { reportError } from '$lib/ui/toast';
  import { itemFileUrl } from '$lib/urls';

  type Props = {
    configJson: ConfigJson;
    imageFiles: string[];
  };

  const { configJson, imageFiles }: Props = $props();

  // Yucky work-around to make values update
  const config = $state(configJson);

  const updater = new DelayedUpdater(async (value: ConfigJson) => {
    await reportError(
      () => api().config.put(value),
      'Error updating configuration',
    );
  }, consts.EDIT_COMMIT_HESITATION);
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

    <h3>Website verification</h3>
    <label for="rel-me">
      <a href="https://indieweb.org/rel-me" target="_blank">
        <h4>rel="me"</h4>
      </a>
    </label>
    <p>Use this verification for GitHub, Mastodon and Wikipedia.</p>
    <TextArea
      id="rel-me"
      bind:value={() => config.verification.relMe.join('\n'),
      (relMe: string) => {
        if (relMe.trim() === '') {
          config.verification.relMe = [];
        } else {
          config.verification.relMe = relMe.trim().split('\n');
        }
      }}
      oninput={() => updater.update(config)}
      placeholder="https://social.example.com/@username"
    />
    <p>Place each URL on a separate line.</p>
    <p>The links will be included as:</p>
    <CodeBlock
      language="html"
      code={config.verification.relMe
        .map((me) => `<link rel="me" href="${me}" />`)
        .join('\n')}
    />

    <label for="at-verification">
      <a href="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial">
        <h4>AT Protocol</h4>
      </a>
    </label>
    <p>Use this verification for Bluesky.</p>
    <TextInput
      id="at-verification"
      bind:value={() => config.verification.atProtocol ?? '',
      (did: string) => {
        if (did) {
          config.verification.atProtocol = did;
        } else {
          config.verification.atProtocol = null;
        }
      }}
      oninput={() => updater.update(config)}
      placeholder="did:plc:abcdef..."
    />

    <label for="google-verification">
      <a href="https://support.google.com/webmasters/answer/9008080?hl=en#zippy=%2Chtml-tag">
        <h4>Google Search Console</h4>
      </a>
    </label>
    <p>Use this verification for Google Search Console.</p>
    <TextInput
      id="google-verification"
      bind:value={() => config.verification.google ?? '',
      (newValue: string) => {
        if (newValue) {
          config.verification.google = newValue;
        } else {
          config.verification.google = null;
        }
      }}
      oninput={() => updater.update(config)}
    />

    <label for="bing-verification">
      <a href="https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b">
        <h4>Bing Webmaster</h4>
      </a>
    </label>
    <p>Use this verification for Bing Webmaster Tools.</p>
    <TextInput
      id="bing-verification"
      bind:value={() => config.verification.bing ?? '',
      (newValue: string) => {
        if (newValue) {
          config.verification.bing = newValue;
        } else {
          config.verification.bing = null;
        }
      }}
      oninput={() => updater.update(config)}
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
