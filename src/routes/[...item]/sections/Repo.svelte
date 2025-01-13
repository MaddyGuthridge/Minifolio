<script lang="ts">
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

  const { url, icon, providerName, starCount } = $derived.by(() => {
    if (repoIsWithProvider(repo.info)) {
      const provider = repoProviders[repo.info.provider];
      return {
        url: provider.makeUrl(repo.info.path),
        icon: provider.icon,
        providerName: provider.name,
        starCount: provider.getStarCount
          ? provider.getStarCount(repo.info.path)
          : Promise.resolve(undefined),
      };
    } else {
      return {
        url: repo.info.url,
        icon: repo.info.icon,
        providerName: repo.info.title,
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
        url: '',
        icon: '',
      };
    }
    onchange();
  }
</script>

{#if !editing}
  <a href={url} target="_blank">
    <i class={icon}></i>
    <b>{displayLabel}</b>
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
  </a>
{:else}
  <input
    type="text"
    bind:value={repo.label}
    oninput={onchange}
    placeholder={displayLabel}
  />
  <select
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
    <input
      type="text"
      bind:value={repo.info.title}
      oninput={onchange}
      placeholder="Provider name"
    />
    <input
      type="url"
      bind:value={repo.info.url}
      oninput={onchange}
      placeholder="Repository URL"
    />
    <input
      type="text"
      bind:value={repo.info.icon}
      oninput={onchange}
      placeholder="LineAwesome Icon"
    />
  {:else}
    <!-- Standard provider -->
    <input
      type="text"
      bind:value={repo.info.path}
      oninput={onchange}
      placeholder="Repository Path"
    />
  {/if}
{/if}

<style>
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
