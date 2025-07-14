<script lang="ts">
  import { Separator } from '$components';
  import { Select, TextInput } from '$components/base';
  import { CopyButton } from '$components/base/button';
  import {
    packageProviders,
    supportedPackageProviders,
    type PackageProvider,
  } from '$lib/packageInfo';
  import type { PackageSection } from '$lib/server/data/item/section';
  import { constArrayIncludes } from '$lib/util';

  type Props = {
    section: PackageSection,
    editing: boolean,
    onchange: () => void,
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
      } else {
        // Otherwise, just change the provider
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

{#snippet display(link: boolean)}
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
{/snippet}

<div class="section-main">
  {#if !editing}
    {@render display(true)}
  {:else}
    <div class="edit-outer">
      <div class="edit-grid">
        <label for="repo-label-text">Label text</label>
        <TextInput
          id="repo-label-text"
          bind:value={section.label}
          oninput={commitChange}
          placeholder={callToAction}
        />
        <label for="repo-provider">Repo provider</label>
        <Select
          id="repo-provider"
          bind:value={() => section.info.provider,
          newProvider => changePackageProvider(newProvider)}
        >
          <option value="custom">- Custom -</option>
          {#each Object.entries(packageProviders) as [provider, info]}
            <option value={provider}>{info.name}</option>
          {/each}
        </Select>
        {#if section.info.provider === 'custom'}
          <label for="provider-name">Provider name</label>
          <TextInput
            id="provider-name"
            bind:value={section.info.providerName}
            oninput={commitChange}
            placeholder="Provider name"
            required
          />
          <label for="install-command">Installation command</label>
          <TextInput
            id="install-command"
            bind:value={section.info.command}
            oninput={commitChange}
            placeholder="Installation command"
            required
          />
          <label for="package-url">Package URL</label>
          <TextInput
            id="package-url"
            bind:value={section.info.url}
            oninput={commitChange}
            placeholder="Package URL"
            required
          />
          <label for="package-icon">Icon</label>
          <TextInput
            id="package-icon"
            bind:value={section.info.command}
            oninput={commitChange}
            placeholder="Icon"
          />
        {:else}
          <label for="package-id">Package ID</label>
          <TextInput
            id="package-id"
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

  label {
    display: flex;
    align-items: center;
  }
</style>
