<script lang="ts">
  type Props = {
    path?: string;
  };

  const { path = '/minifolio.png' }: Props = $props();
</script>

<link rel="icon" href={path} />
