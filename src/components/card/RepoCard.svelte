<script lang="ts">
  import type { RepoInfo } from '$lib/server/data/item/repo';
  import { repoIsWithProvider, repoProviders } from '$lib/repoInfo';
  import { Card } from '.';
  import { onMount } from 'svelte';
  import { tooltip } from '$lib/tooltip';

  type Props = {
    repo: RepoInfo;
    color: string;
  };

  let { repo, color }: Props = $props();

  let repoUrl = $derived(
    repoIsWithProvider(repo)
      ? repoProviders[repo.provider].makeUrl(repo.path)
      : repo.url,
  );

  let repoString = $derived(
    repoIsWithProvider(repo)
      ? `${repoProviders[repo.provider].name}: ${repo.path}`
      : repo.title,
  );

  let repoIcon = $derived(
    repoIsWithProvider(repo)
      ? repoProviders[repo.provider].icon
      : (repo.icon ?? 'las la-code-branch'),
  );

  async function fetchRepoStarCount(
    repo: RepoInfo,
  ): Promise<number | undefined> {
    // Manual repos can't display star counts
    if (!repoIsWithProvider(repo)) {
      return Promise.resolve(undefined);
    }

    const provider = repoProviders[repo.provider];
    if (provider.getStarCount === undefined) {
      // No way to fetch the star count
      return Promise.resolve(undefined);
    } else {
      // Fetch the star count
      return provider.getStarCount(repo.path);
    }
  }

  let repoStarCount: Promise<number | undefined> = $state(
    Promise.resolve(undefined),
  );

  onMount(() => {
    repoStarCount = fetchRepoStarCount(repo);
  });
</script>

<Card link={{ url: repoUrl, newTab: true }} {color}>
  <span>
    <div class="icon-div">
      <i class={repoIcon}></i>
    </div>
    <h3>{repoString}</h3>
    {#await repoStarCount}
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
    {:catch e}
      <div class="star-count">
        <i class="lar la-star"></i>
        {e}
      </div>
    {/await}
  </span>
</Card>

<style>
  span {
    display: flex;
    gap: 10px;
    align-items: center;
    height: 100%;
  }

  .icon-div {
    font-size: 3em;
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
