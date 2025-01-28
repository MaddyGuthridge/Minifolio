<script lang="ts">
  type Props = {
    fontFamily?: string;

    // Default textarea props
    value: string;
    onkeypress?: (e: KeyboardEvent) => any;
    oninput?: () => any;
  };

  let {
    fontFamily,
    value = $bindable(),
    onkeypress,
    oninput,
  }: Props = $props();
</script>

<div
  class="expandable-textarea"
  role="textbox"
  contenteditable
  bind:innerText={value}
  tabindex={0}
  {onkeypress}
  {oninput}
  style:--font={fontFamily}
></div>

<style>
  .expandable-textarea {
    font-family: var(--font);
    resize: var(--resize);
    /* https://www.geeksforgeeks.org/how-to-make-textarea-100-without-overflow-when-padding-is-present/ */
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 10px;
    background-color: transparent;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: background-color 0.5s;
  }

  .expandable-textarea:focus {
    background-color: rgba(255, 255, 255, 0.9);
    transition: background-color 0.5s;
  }
</style>
