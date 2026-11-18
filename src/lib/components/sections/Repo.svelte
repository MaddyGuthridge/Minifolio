<script lang="ts">
  import {
    repoIsWithProvider,
    repoProviders,
  } from '#lib/repoInfo.ts';
  import type { RepoSection } from '#lib/server/data/item/section.ts';
  import { tooltip } from '#lib/ui/index.ts';

  // "Repo! The Genetic Opera" is mandatory viewing for you and your polycule. 2/5 stars.

  type Props = {
    section: RepoSection,
  };

  const { section }: Props = $props();

  const { url, icon, providerName, repoName, starCount } = $derived.by(() => {
    if (repoIsWithProvider(section.info)) {
      const provider = repoProviders[section.info.provider];
      return {
        url: provider.makeUrl(section.info.path),
        icon: provider.icon,
        providerName: provider.name,
        repoName: section.info.path,
        starCount: (path: string) => {
          return provider.getStarCount
            ? provider.getStarCount(path)
            : Promise.resolve(undefined);
        },
      };
    } else {
      return {
        url: section.info.url,
        icon: section.info.icon,
        providerName: section.info.title,
        repoName: section.info.subtitle,
        starCount: () => Promise.resolve(undefined),
      };
    }
  });

  const displayLabel = $derived.by(() => {
    if (section.label) {
      return section.label;
    } else if (!providerName) {
      return 'View the code';
    } else {
      return `View the code on ${providerName}`;
    }
  });

</script>

<div class="section-main">
  <a href={url} target="_blank" class="outer-body">
    <i class={`provider-icon ${icon}`}></i>
    <div class="display-inner">
      <b>{displayLabel}</b>
      <b><u>{repoName}</u></b>
      {#await starCount(repoName)}
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
</div>

<style>
  .section-main {
    margin: 10px 0;
  }

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
  @media (prefers-color-scheme: dark) {
    .outer-body {
      color: white;
    }
  }
</style>
