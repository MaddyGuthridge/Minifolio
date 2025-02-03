<script lang="ts">
  import consts from '$lib/consts';

  type Props = {
    path?: string;
  };

  const { path }: Props = $props();

  const actualPath = path ? `/data/${path}` : consts.APP_ICON_URL;
</script>

<link rel="icon" href={actualPath} />
