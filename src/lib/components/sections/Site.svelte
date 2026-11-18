<script lang="ts">
  import type { SiteSection } from '#lib/server/data/item/section.ts';

  type Props = {
    section: SiteSection,
    link: boolean,
  };

  const { section, link }: Props = $props();
</script>

<div class="section-main">
  {#if link}
    <a href={section.url} target="_blank" class="display-outer">
      <i class="icon {section.icon ?? 'las la-globe'}"></i>
      <div>
        <h3>{section.label ?? 'Visit the website'}</h3>
        <p><b><u>{section.url}</u></b></p>
      </div>
    </a>
  {:else}
    <div class="display-outer">
      <i class="icon {section.icon ?? 'las la-globe'}"></i>
      <div>
        <h3>{section.label ?? 'Visit the website'}</h3>
        <p><b><u>{section.url}</u></b></p>
      </div>
    </div>
  {/if}

</div>

<style>
  .section-main {
    margin: 10px 0;
  }

  h3,
  p {
    margin: 0;
  }

  .display-outer {
    text-decoration: none;
    color: black;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .icon {
    font-size: 5rem;
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

  @media (prefers-color-scheme: dark) {
    .display-outer {
      color: white;
    }
  }
</style>
