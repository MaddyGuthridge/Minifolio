<script lang="ts">
  type Props = {
    title: string;
    url: string;
  };

  const { title, url }: Props = $props();
</script>

<a href={url}>
  <i class="las la-book-open"></i>
  <b>{title}</b>
</a>
