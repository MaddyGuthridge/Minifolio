<script lang="ts">
  import { Button } from '$components/base';
  import { colorName } from '$lib/color';

  type Props = {
    value: string;
    oninput?: () => any;
    required?: boolean;
  };

  let { value = $bindable(), oninput, required }: Props = $props();

  const name = $derived(colorName(value));

  let picker: HTMLInputElement;
</script>

<div>
  <Button onclick={() => picker.click()}>
    <div class="button-wrap">
      <span>{name}</span>
      <div class="color-preview" style:--color={value}></div>
    </div>
  </Button>
  <input
    type="color"
    bind:value
    {oninput}
    {required}
    style="display: none"
    bind:this={picker}
  />
</div>

<style>
  .button-wrap {
    display: flex;
    gap: 5px;
  }
  .color-preview {
    background-color: var(--color);
    width: 20px;
    height: 20px;
    border-radius: 100%;
    border: 1px solid rgba(0, 0, 0, 0.5);
  }
</style>
