<script lang="ts">
  import { CopyButton } from '#lib/components/base/button/index.ts';
  import { packageProviders } from '#lib/packageInfo.ts';
  import type { PackageSection } from '#lib/server/data/item/section.ts';

  type Props = {
    section: PackageSection,
    link: boolean,
  };

  const { section, link }: Props = $props();

  const { providerName, url, icon, command } = $derived.by(() => {
    if (section.info.provider === 'custom') {
      return {
        url: section.info.url,
        providerName: section.info.providerName,
        icon: section.info.icon,
        command: section.info.command,
      };
    } else {
      const provider = packageProviders[section.info.provider];
      return {
        url: provider.makeUrl(section.info.id),
        providerName: provider.name,
        icon: provider.icon,
        command: provider.makeInstallCmd(section.info.id),
      };
    }
  });

  const callToAction = $derived(
    providerName.length
      ? `Install using ${providerName}`
      : 'Install the package',
  );
</script>

<div class="display-outer">
  {#if link}
    <a
      href={url}
      target="_blank"
      aria-labelledby="package-call-to-action"
      tabindex={-1}
    >
      <i class={`icon ${icon ?? 'las la-laptop-code'}`}></i>
    </a>
  {:else}
    <i class={`icon ${icon ?? 'las la-laptop-code'}`}></i>
  {/if}
  <div>
    <div>
      {#if link}
        <a href={url} target="_blank">
          <b id="package-call-to-action">{section.label ?? callToAction}</b>
        </a>
      {:else}
        <b>{section.label ?? callToAction}</b>
      {/if}
    </div>
    <CopyButton text={command} hint="Copy install command">
      <div class="install-btn">
        <i class="las la-terminal"></i>
        <pre>{command}</pre>
      </div>
    </CopyButton>
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
  }
  .display-outer {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .display-outer a {
    text-decoration: none;
    color: black;
  }
  .icon {
    font-size: 5rem;
  }

  .install-btn {
    display: flex;
    gap: 5px;
  }
  .install-btn > pre {
    margin: 0px;
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

  @media (prefers-color-scheme: dark) {
    .display-outer a {
      color: white;
    }
  }
</style>
