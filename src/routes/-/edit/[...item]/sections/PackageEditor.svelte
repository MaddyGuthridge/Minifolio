<script lang="ts">
  import { Separator } from '#lib/components/index.ts';
  import { Select, TextInput } from '#lib/components/base/index.ts';
  import {
    packageProviders,
    supportedPackageProviders,
    type PackageProvider,
  } from '#lib/packageInfo.ts';
  import type { PackageSection } from '#lib/server/data/item/section.ts';
  import { constArrayIncludes } from '#lib/util.ts';
  import Package from '#lib/components/sections/Package.svelte';

  type Props = {
    section: PackageSection,
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

  const { section = $bindable(), onchange }: Props = $props();

  const providerName = $derived(section.info.provider === 'custom'
    ? section.info.providerName
    : packageProviders[section.info.provider].name);

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

<div class="section-main">
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
        {#each Object.entries(packageProviders) as [provider, info] (provider)}
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
    <Package {section} link={false} />
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
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
