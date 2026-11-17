<script lang="ts">
  import Modal from './Modal.svelte';

  type Props = {
    header: string,
    text: string,
    show: boolean,
    onclose: () => void,
  };

  const { text, show, header, onclose }: Props = $props();
</script>

<Modal {show} color="#ffaaaa" {onclose}>
  <h1>{header}</h1>
  <i class="las la-exclamation-circle"></i>
  <p>{text}</p>
</Modal>

<style>
  i {
    font-size: 3rem;
  }
</style>
