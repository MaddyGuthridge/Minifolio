<script lang="ts">
  import CopyButton from '$components/CopyButton.svelte';
  import { packageProviders } from '$lib/packageInfo';
  import type { PackageSection } from '$lib/server/data/item/section';

  const { label, info }: PackageSection = $props();

  const { providerName, url, icon, command } = $derived.by(() => {
    if (info.provider === 'custom') {
      return {
        url: info.url,
        providerName: info.providerName,
        icon: info.icon,
        command: info.command,
      };
    } else {
      const provider = packageProviders[info.provider];
      return {
        url: provider.makeUrl(info.id),
        providerName: provider.name,
        icon: provider.icon,
        command: provider.makeInstallCmd(info.id),
      };
    }
  });
</script>

<a href={url}>
  <i class={icon}></i>
  <b>{label ?? `Install using ${providerName}`}</b>
  <CopyButton text={command} hint="Copy install command">
    <i class="las la-terminal"></i>
    <pre>{command}</pre>
  </CopyButton>
</a>
