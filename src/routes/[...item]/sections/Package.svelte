<script lang="ts">
  import { Separator } from '$components';
  import CopyButton from '$components/CopyButton.svelte';
  import {
    packageProviders,
    supportedPackageProviders,
  } from '$lib/packageInfo';
  import { type PackageProvider } from '$lib/server/data/item/package';
  import type { PackageSection } from '$lib/server/data/item/section';
  import { constArrayIncludes } from '$lib/util';

  type Props = {
    section: PackageSection;
    editing: boolean;
    onchange: () => void;
  };

  function commitChange() {
    if (section.label === '') {
      section.label = null;
    }
    if (section.info.provider === 'custom') {
      if (section.info.icon === '') {
        section.info.icon = null;
      }
    }
    onchange();
  }

  const { section = $bindable(), editing, onchange }: Props = $props();

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

  function changePackageProvider(newProvider: PackageProvider | 'custom') {
    if (constArrayIncludes(supportedPackageProviders, newProvider)) {
      // Changing from custom repo provider
      if (section.info.provider === 'custom') {
        section.info = {
          provider: newProvider,
          id: '',
        };
      }
      // Otherwise, just change the provider
      else {
        section.info.provider = newProvider;
      }
    } else {
      section.info = {
        provider: newProvider,
        providerName: '',
        command: '',
        url: '',
        icon: null,
      };
    }
    onchange();
  }

  const callToAction = $derived(
    providerName.length
      ? `Install using ${providerName}`
      : 'Install the package',
  );
</script>

{#snippet display_inner()}
  <i class={`icon ${icon ?? 'las la-laptop-code'}`}></i>
  <div>
    <b>{section.label ?? callToAction}</b>
    <CopyButton text={command} hint="Copy install command">
      <i class="las la-terminal"></i>
      <pre>{command}</pre>
    </CopyButton>
  </div>
{/snippet}

{#snippet display(link: boolean)}
  {#if link}
    <a href={url} target="_blank" class="display-outer">
      {@render display_inner()}
    </a>
  {:else}
    <div class="display-outer">
      {@render display_inner()}
    </div>
  {/if}
{/snippet}

{#if !editing}
  {@render display(true)}
{:else}
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="repo-label-text">Label text</label>
      <input
        type="text"
        id="repo-label-text"
        bind:value={section.label}
        oninput={commitChange}
        placeholder={callToAction}
      />
      <label for="repo-provider">Repo provider</label>
      <select
        id="repo-provider"
        bind:value={() => section.info.provider,
        (newProvider) => changePackageProvider(newProvider)}
      >
        <option value="custom">- Custom -</option>
        {#each Object.entries(packageProviders) as [provider, info]}
          <option value={provider}>{info.name}</option>
        {/each}
      </select>
      {#if section.info.provider === 'custom'}
        <label for="provider-name">Provider name</label>
        <input
          type="text"
          id="provider-name"
          bind:value={section.info.providerName}
          oninput={commitChange}
          placeholder="Provider name"
          required
        />
        <label for="install-command">Installation command</label>
        <input
          type="text"
          id="install-command"
          bind:value={section.info.command}
          oninput={commitChange}
          placeholder="Installation command"
          required
        />
        <label for="package-url">Package URL</label>
        <input
          type="url"
          id="package-url"
          bind:value={section.info.url}
          oninput={commitChange}
          placeholder="Package URL"
          required
        />
        <label for="package-icon">Icon</label>
        <input
          type="text"
          id="package-icon"
          bind:value={section.info.command}
          oninput={commitChange}
          placeholder="Icon"
        />
      {:else}
        <label for="package-url">Package ID</label>
        <input
          type="url"
          id="package-url"
          bind:value={section.info.id}
          oninput={commitChange}
          placeholder="Package ID"
          required
        />
      {/if}
    </div>
    <Separator />
    {@render display(false)}
  </div>
{/if}

<style>
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
</style>
