<script lang="ts">
  import Modal from './Modal.svelte';

  type Props = {
    header: string,
    text: string,
    show: boolean,
  };

  const { header, text, show }: Props = $props();
</script>

<Modal {show} color="white" showCloseButton={false} onclose={() => {}}>
  <h1>{header}</h1>
  <i class="las la-sync spin"></i>
  <p>{text}</p>
</Modal>

<style>
  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .spin {
    animation: rotating 2s linear infinite;
    font-size: 3rem;
  }
</style>
