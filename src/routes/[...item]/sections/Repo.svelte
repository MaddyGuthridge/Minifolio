<script lang="ts">
  import { repoIsWithProvider, repoProviders } from '$lib/repoInfo';
  import type { RepoSection } from '$lib/server/data/item/section';
  import { tooltip } from '$lib/tooltip';

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

  // When the info.provider changes
  $effect(() => {
    
  });
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
  <select bind:value={info.provider}>
    <option value="custom">- Custom -</option>
    {#each Object.keys(repoProviders) as provider}
      <option value={provider}>{provider}</option>
    {/each}
  </select>
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
