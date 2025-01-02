<script lang="ts">
  type Props = {
    title: string;
    url: string;
  };

  const { title, url }: Props = $props();
</script>

<a href={url}>
  <i class="las la-globe"></i>
  <b>{title}</b>
</a>
