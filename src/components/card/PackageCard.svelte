<script lang="ts">
  import { packageIsWithProvider, packageProviders } from '$lib/packageInfo';
  import { Card } from '.';
  import type { PackageInfo } from '$lib/server/data/item/package';
  import CopyButton from '$components/CopyButton.svelte';

  type Props = {
    info: PackageInfo;
    color: string;
  };

  let { info, color }: Props = $props();

  let packageUrl = $derived(
    packageIsWithProvider(info)
      ? packageProviders[info.provider].makeUrl(info.id)
      : info.url,
  );

  let providerName = $derived(
    packageIsWithProvider(info)
      ? packageProviders[info.provider].name
      : info.providerName,
  );

  let providerIcon = $derived(
    packageIsWithProvider(info)
      ? packageProviders[info.provider].icon
      : info.icon,
  );

  let installCommand = $derived(
    packageIsWithProvider(info)
      ? packageProviders[info.provider].makeInstallCmd(info.id)
      : info.command,
  );
</script>

<Card link={{ url: packageUrl, newTab: true }} {color}>
  <span>
    <div class="provider-info">
      <i class={providerIcon}></i>
      <b>{providerName}</b>
    </div>
    <CopyButton text={installCommand} hint="Copy install command">
      <i class="las la-terminal"></i>
      <pre>{installCommand}</pre>
    </CopyButton>
  </span>
</Card>

<style>
  span {
    display: flex;
    align-items: center;
    gap: 20px;
    height: 100%;
  }
  /* Icons */
  i {
    font-size: 2em;
  }
  .provider-info {
    display: flex;
    align-items: center;
  }
  pre {
    font-size: 1.5em;
    margin: 0px;
  }
</style>
