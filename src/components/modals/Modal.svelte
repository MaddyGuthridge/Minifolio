<script lang="ts">
  import type { Snippet } from 'svelte';
  type Props = {
    show: boolean;
    color?: string;
    showCloseButton?: boolean;
    header?: Snippet;
    children?: Snippet;
    onclose: () => void;
  };

  let {
    show,
    color = 'white',
    showCloseButton = true,
    header,
    children,
    onclose,
  }: Props = $props();

  let display = $derived(show ? 'block' : 'none');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="outer" style="display: {display};" onclick={onclose}>
  <div class="inner">
    <div
      class="box"
      style="background-color: {color};"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="header">
        {@render header?.()}
        {#if showCloseButton}
          <span></span>
          <!-- svelte-ignore a11y_consider_explicit_label -->
          <button onclick={onclose}>
            <i class="las la-times"></i>
          </button>
        {/if}
      </div>
      <div class="main-content">
        {@render children?.()}
      </div>
    </div>
  </div>
</div>

<style>
  .outer {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
  }

  .box {
    max-width: 500px;
    width: 90%;
    border-radius: 10px;
  }

  .header {
    margin: 20px;
    display: grid;
    grid-template-columns: 1fr auto 4rem;
    grid-template-rows: 1fr;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
  }

  button {
    border: none;
    background-color: transparent;
  }
  button:hover {
    cursor: pointer;
  }
  button > i {
    font-size: 3rem;
  }
</style>
