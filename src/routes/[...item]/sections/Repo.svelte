<script lang="ts">
  import { Separator } from '$components';
  import {
    repoIsWithProvider,
    repoProviders,
    supportedRepoProviders,
  } from '$lib/repoInfo';
  import { type RepoProvider } from '$lib/server/data/item/repo';
  import type { RepoSection } from '$lib/server/data/item/section';
  import { tooltip } from '$lib/tooltip';
  import { constArrayIncludes } from '$lib/util';

  type Props = {
    repo: RepoSection;
    editing: boolean;
    onchange: () => void;
  };

  let { repo = $bindable(), editing, onchange }: Props = $props();

  const { url, icon, providerName, repoName, starCount } = $derived.by(() => {
    if (repoIsWithProvider(repo.info)) {
      const provider = repoProviders[repo.info.provider];
      return {
        url: provider.makeUrl(repo.info.path),
        icon: provider.icon,
        providerName: provider.name,
        repoName: repo.info.path,
        starCount: provider.getStarCount
          ? provider.getStarCount(repo.info.path)
          : Promise.resolve(undefined),
      };
    } else {
      return {
        url: repo.info.url,
        icon: repo.info.icon,
        providerName: repo.info.title,
        repoName: repo.info.subtitle,
        starCount: Promise.resolve(undefined),
      };
    }
  });

  const displayLabel = $derived.by(() => {
    if (repo.label) {
      return repo.label;
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
      if (repo.info.provider === 'custom') {
        repo.info = {
          provider: newProvider,
          // Replace it with the content after the domain name
          path: repo.info.url.replace(/^https:\/\//, '').split('/')[1] ?? '',
        };
      }
      // Otherwise, just change the provider
      else {
        repo.info.provider = newProvider;
      }
    } else {
      repo.info = {
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

{#snippet display()}
  <a href={url} target="_blank" class="outer-body">
    <i class={`provider-icon ${icon}`}></i>
    <div class="display-inner">
      <b>{displayLabel}</b>
      <b><u>{repoName}</u></b>
      {#await starCount}
        <div class="star-count" use:tooltip={{ content: 'Loading star count' }}>
          <i class="lar la-star"></i> <i class="las la-sync spinner"></i>
        </div>
      {:then stars}
        <!-- Only show star count if the project has stars -->
        {#if stars}
          <div
            class="star-count"
            use:tooltip={{
              content: `Repository has ${stars} star${stars === 1 ? '' : 's'}`,
            }}
          >
            <i class="lar la-star"></i>
            {stars}
          </div>
        {/if}
      {/await}
    </div>
  </a>
{/snippet}

{#if !editing}
  {@render display()}
{:else}
  <div class="edit-outer">
    <div class="edit-grid">
      <label for="repo-section-label">Section label</label>
      <input
        type="text"
        id="repo-section-label"
        bind:value={repo.label}
        oninput={onchange}
        placeholder={displayLabel}
      />
      <label for="repo-provider">Repo provider</label>
      <select
        id="repo-provider"
        bind:value={() => repo.info.provider,
        (newProvider) => changeRepoProvider(newProvider)}
      >
        <option value="custom">- Custom -</option>
        {#each Object.entries(repoProviders) as [provider, info]}
          <option value={provider}>{info.name}</option>
        {/each}
      </select>
      {#if repo.info.provider === 'custom'}
        <!-- Custom provider -->
        <label for="repo-provider-name">Provider name</label>
        <input
          type="text"
          id="repo-provider-name"
          bind:value={repo.info.title}
          oninput={onchange}
          placeholder="Provider name"
        />
        <label for="repo-custom-subtitle">Subtitle</label>
        <input
          type="text"
          id="repo-custom-subtitle"
          bind:value={repo.info.subtitle}
          oninput={onchange}
          placeholder="Subtitle"
        />
        <label for="repo-url">Repository URL</label>
        <input
          type="url"
          id="repo-url"
          bind:value={repo.info.url}
          oninput={onchange}
          placeholder="Repository URL"
        />
        <label for="repo-icon">Repository icon</label>
        <input
          type="text"
          id="repo-icon"
          bind:value={repo.info.icon}
          oninput={onchange}
          placeholder="LineAwesome Icon"
        />
      {:else}
        <!-- Standard provider -->
        <label for="repo-path">Repository path</label>
        <input
          type="text"
          id="repo-path"
          bind:value={repo.info.path}
          oninput={onchange}
          placeholder="Repository Path"
        />
      {/if}
    </div>
    <Separator />
    {@render display()}
  </div>
{/if}

<style>
  .outer-body {
    display: flex;
    text-decoration: none;
    color: black;
  }

  .provider-icon {
    font-size: 5rem;
  }

  .display-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
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

  .star-count {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 1.5em;
  }

  .spinner {
    animation: spin 1s infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
