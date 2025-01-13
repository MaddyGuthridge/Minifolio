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

  type Props = RepoSection & {
    editing: boolean;
  };

  let { label = $bindable(), info = $bindable(), editing }: Props = $props();

  const { url, icon, providerName, starCount } = $derived.by(() => {
    if (repoIsWithProvider(info)) {
      const provider = repoProviders[info.provider];
      return {
        url: provider.makeUrl(info.path),
        icon: provider.icon,
        providerName: provider.name,
        starCount: provider.getStarCount
          ? provider.getStarCount(info.path)
          : Promise.resolve(undefined),
      };
    } else {
      return {
        url: info.url,
        icon: info.icon,
        providerName: info.title,
        starCount: Promise.resolve(undefined),
      };
    }
  });

  /** Called when changing repo provider */
  function changeRepoProvider(newProvider: RepoProvider | 'custom') {
    if (constArrayIncludes(supportedRepoProviders, newProvider)) {
      if (info.provider === 'custom') {
        // Changing from custom repo provider
        info = {
          provider: newProvider,
          // Replace it with the content after the domain name
          path: info.url.replace(/^https:\/\//, '').split('/')[1] ?? '',
        };
      }
    } else {
      info = {
        provider: newProvider,
        title: '',
        url: '',
        icon: '',
      };
    }
  }
</script>

{#if !editing}
  <a href={url}>
    <i class={icon}></i>
    <b>{label ?? `View the code on ${providerName}`}</b>
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
  <input type="text" bind:value={label} placeholder="Label text" />
  <select
    bind:value={() => info.provider,
    (newProvider) => changeRepoProvider(newProvider)}
  >
    <option value="custom">- Custom -</option>
    {#each Object.keys(repoProviders) as provider}
      <option value={provider}>{provider}</option>
    {/each}
  </select>

  {#if info.provider === 'custom'}
    <!-- Custom provider -->
    <input type="text" bind:value={info.title} placeholder="Provider name" />
    <input type="url" bind:value={info.url} placeholder="Repository URL" />
    <input type="text" bind:value={info.icon} placeholder="LineAwesome Icon" />
  {:else}
    <!-- Standard provider -->
    <input type="text" bind:value={info.path} placeholder="Repository Path" />
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
