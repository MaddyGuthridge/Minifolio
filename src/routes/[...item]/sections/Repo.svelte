<script lang="ts">
  import { repoIsWithProvider, repoProviders } from '$lib/repoInfo';
  import type { RepoSection } from '$lib/server/data/item/section';
  import { tooltip } from '$lib/tooltip';

  const { label, info }: RepoSection = $props();

  const { url, icon, providerName, starCount } = $derived.by(() => {
    if (repoIsWithProvider(info)) {
      const provider = repoProviders[info.provider];
      return {
        url: provider.makeUrl(info.path),
        icon: provider.icon,
        providerName: provider.name,
        starCount: provider.getStarCount?.(info.path),
      };
    } else {
      return {
        url: info.url,
        icon: info.icon,
        providerName: info.title,
        starCount: undefined,
      };
    }
  });
</script>

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
