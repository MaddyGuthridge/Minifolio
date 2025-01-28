<script lang="ts">
  type Props = {
    /** Font size to use for the input field (in `rem`) */
    size?: number;
    /** Whether input should be a password field */
    password?: boolean;

    // Standard props
    value?: string | null;
    placeholder?: string;
    id?: string;
    name?: string;
    oninput?: () => any;
    required?: boolean;
  };

  let {
    size = 1,
    password = false,
    value = $bindable(),
    placeholder,
    name,
    id,
    oninput,
    required,
  }: Props = $props();

  const inputType = $derived(password ? 'password' : 'text');
</script>

<input
  type={inputType}
  bind:value
  {name}
  {id}
  {oninput}
  {placeholder}
  {required}
  style:--size={`${size}rem`}
/>

<style>
  input {
    font-size: var(--size);
    width: 100%;
    padding: 6px 10px;
    background-color: transparent;
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
</style>
