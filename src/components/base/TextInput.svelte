<script lang="ts">
  type Props = {
    /** Font size to use for the input field (in `rem`) */
    size?: number;
    /**
     * Validator function -- any exception thrown will be displayed as error text.
     */
    validator?: (text: string) => any;
    /** Additional error text, if validator callback is inadequate */
    errorText?: string;
    /** Whether the value is considered to be ok (in that no error message is shown) */
    valueOk?: boolean;

    // Standard props
    type?: 'text' | 'url' | 'email' | 'password';
    value?: string | null;
    placeholder?: string;
    id?: string;
    name?: string;
    oninput?: () => any;
    required?: boolean;
  };

  let {
    size = 1,
    validator,
    errorText,
    valueOk = $bindable(),
    type = 'text',
    value = $bindable(),
    placeholder,
    name,
    id,
    oninput,
    required,
  }: Props = $props();

  let displayErrorMessage = $state(false);
  let errorMessage: string | null = $state(null);
  const overallErrorText = $derived(errorText ?? errorMessage);

  function performValidation() {
    // Only start showing error messages once the user has interacted with this
    // field
    displayErrorMessage = true;
    if (value === null || value === undefined) {
      return;
    }
    try {
      validator?.(value);
      errorMessage = null;
      valueOk = true;
    } catch (e: any) {
      valueOk = false;
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e?.body?.message === 'string') {
        errorMessage = e.body.message;
      } else {
        // If it's not an `Error` object, just stringify it, since that's better than nothing
        errorMessage = `${e}`;
      }
    }
  }

  function handleInput() {
    performValidation();
    oninput?.();
  }
</script>

<div>
  {#if displayErrorMessage && overallErrorText !== null}
    <p class="error-text">{overallErrorText}</p>
  {/if}
  <input
    {type}
    bind:value
    {name}
    {id}
    oninput={handleInput}
    onfocus={performValidation}
    {placeholder}
    {required}
    style:--size={`${size}rem`}
  />
</div>

<style>
  input {
    font-size: var(--size);
    width: 100%;
    padding: 6px 10px;
    background-color: transparent;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    transition: background-color 0.5s;
  }
  input:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
  input:focus {
    border: 1px solid black;
    background-color: rgba(255, 255, 255, 0.9);
  }

  .error-text {
    color: red;
    margin: 1px 0 1px 5px;
  }
</style>
