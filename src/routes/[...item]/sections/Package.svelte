<script lang="ts">
  import CopyButton from '$components/CopyButton.svelte';
  import { packageProviders } from '$lib/packageInfo';
  import type { PackageInfo } from '$lib/server/data/item/package';

  type Props = {
    title: string;
    info: PackageInfo;
  };

  const { title, info }: Props = $props();

  const { url, icon, command } = $derived.by(() => {
    if (info.provider === 'custom') {
      return {
        url: info.url,
        icon: info.icon,
        command: info.command,
      };
    } else {
      const provider = packageProviders[info.provider];
      return {
        url: provider.makeUrl(info.id),
        icon: provider.icon,
        command: provider.makeInstallCmd(info.id),
      };
    }
  });
</script>

<a href={url}>
  <i class={icon}></i>
  <b>{title}</b>
  <CopyButton text={command} hint="Copy install command">
    <i class="las la-terminal"></i>
    <pre>{command}</pre>
  </CopyButton>
</a>
