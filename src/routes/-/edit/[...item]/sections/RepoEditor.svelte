<script lang="ts">
  import { Separator } from '#lib/components/index.ts';
  import { Select, TextInput } from '#lib/components/base/index.ts';
  import {
    repoIsWithProvider,
    repoProviders,
    supportedRepoProviders,
  } from '#lib/repoInfo.ts';
  import { type RepoProvider } from '#lib/server/data/item/repo.ts';
  import type { RepoSection } from '#lib/server/data/item/section.ts';
  import { constArrayIncludes } from '#lib/util.ts';
  import Repo from '#lib/components/sections/Repo.svelte';

  type Props = {
    section: RepoSection,
    onchange: () => void,
  };

  let { section = $bindable(), onchange }: Props = $props();

  const providerName = $derived(repoIsWithProvider(section.info)
    ? repoProviders[section.info.provider].name
    : section.info.title);

  const displayLabel = $derived.by(() => {
    if (section.label) {
      return section.label;
    } else if (!providerName) {
      return 'View the code';
    } else {
      return `View the code on ${providerName}`;
    }
  });

  /** Called when changing repo provider */
  function changeRepoProvider(newProvider: RepoProvider | 'custom') {
    if (constArrayIncludes(supportedRepoProviders, newProvider)) {
      // Changing from custom repo provider
      if (section.info.provider === 'custom') {
        section.info = {
          provider: newProvider,
          // Replace it with the content after the domain name
          path: section.info.url.replace(/^https:\/\//, '').split('/')[1] ?? '',
        };
      } else {
        // Otherwise, just change the provider
        section.info.provider = newProvider;
      }
    } else {
      section.info = {
        provider: newProvider,
        title: '',
        subtitle: '',
        url: '',
        icon: '',
      };
    }
    onchange();
  }
</script>

<div class="section-main">
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="repo-section-label">Section label</label>
      <TextInput
        id="repo-section-label"
        bind:value={section.label}
        oninput={onchange}
        placeholder={displayLabel}
      />
      <label for="repo-provider">Repo provider</label>
      <Select
        id="repo-provider"
        bind:value={() => section.info.provider,
          newProvider => changeRepoProvider(newProvider)}
      >
        <option value="custom">- Custom -</option>
        {#each Object.entries(repoProviders) as [provider, info] (provider)}
          <option value={provider}>{info.name}</option>
        {/each}
      </Select>
      {#if section.info.provider === 'custom'}
        <!-- Custom provider -->
        <label for="repo-provider-name">Provider name</label>
        <TextInput
          id="repo-provider-name"
          bind:value={section.info.title}
          oninput={onchange}
          placeholder="Provider name"
        />
        <label for="repo-custom-subtitle">Subtitle</label>
        <TextInput
          id="repo-custom-subtitle"
          bind:value={section.info.subtitle}
          oninput={onchange}
          placeholder="Subtitle"
        />
        <label for="repo-url">Repository URL</label>
        <TextInput
          id="repo-url"
          bind:value={section.info.url}
          oninput={onchange}
          placeholder="Repository URL"
        />
        <label for="repo-icon">Repository icon</label>
        <TextInput
          id="repo-icon"
          bind:value={section.info.icon}
          oninput={onchange}
          placeholder="LineAwesome Icon"
        />
      {:else}
        <!-- Standard provider -->
        <label for="repo-path">Repository path</label>
        <TextInput
          id="repo-path"
          bind:value={section.info.path}
          oninput={onchange}
          placeholder="Repository Path"
        />
      {/if}
    </div>
    <Separator />
    <Repo {section} />
  </div>
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  .edit-outer {
    display: flex;
    align-items: center;
    gap: 10px;
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
