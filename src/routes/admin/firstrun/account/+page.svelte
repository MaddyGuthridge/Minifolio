<script lang="ts">
  import { dev } from '$app/environment';
  import api from '$endpoints';
  import Paper from '$components/Paper.svelte';
  import Background from '$components/Background.svelte';
  import Spinner from '$components/modals/Spinner.svelte';
  import Error from '$components/modals/Error.svelte';
  import { goto } from '$app/navigation';
  import Navbar from '$components/navbar';
  import { blankData } from '$lib/blankData';
  import consts from '$lib/consts';
  import { idValidatorRegex } from '$lib/validate';

  // Default values are auto-filled in dev mode
  let username = $state(dev ? 'admin' : '');
  let password = $state(dev ? 'abc123ABC!' : '');
  let repeatPassword = $state(dev ? 'abc123ABC!' : '');

  async function createAccount() {
    showLoading = true;
    try {
      await api().admin.firstrun.account(username, password);
      await goto('/admin/firstrun/data');
    } catch (e) {
      errorText = `${e}`;
      showLoading = false;
    }
  }

  async function onSubmit() {
    // Validate passwords match
    if (password !== repeatPassword) {
      errorText = 'Passwords must match';
      return;
    }
    await createAccount();
  }

  let showLoading = $state(false);

  let errorText = $state('');
</script>

<svelte:head>
  <title>Setup - {consts.APP_NAME}</title>
  <meta name="generator" content={consts.APP_NAME} />
  <meta name="theme-color" content="#aa00aa" />
  <!--
    Prevent web crawlers from indexing the firstrun page. Of course, if someone
    has an instance of this exposed to the open web without it being set up,
    that's absolutely on them, but the least we can do is stop instances that
    aren't set up from being easily searchable.
  -->
  <meta name="robots" content="noindex" />
</svelte:head>

<Background color="#aa00aa"></Background>

<Navbar data={blankData} loggedIn={undefined} path={[]} />

<div class="center">
  <Paper>
    <main>
      <div class="center">
        <h1 style="font-size: 3rem">
          Welcome to your fancy new portfolio website!
        </h1>
        <h2>Let's get set up!</h2>
        {#if dev}
          <p>Values are auto-filled in dev mode.</p>
        {/if}
      </div>

      <form onsubmit={onSubmit}>
        <h3>Login information</h3>
        <p>
          Create a username. It may only use lowercase alphanumeric characters,
          dots, dashes and underscores.
        </p>
        <input
          type="text"
          id="username"
          pattern={idValidatorRegex.source}
          title="Username contains illegal characters"
          bind:value={username}
          placeholder="username"
        />

        <p>Create a strong and unique password.</p>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="A strong and unique password"
        />
        <p>Repeat your password.</p>
        <input
          type="password"
          id="repeatPassword"
          bind:value={repeatPassword}
          placeholder="Repeat your password"
        />
        <input type="submit" id="submit-main" value="Create account" />
      </form>
    </main>
  </Paper>
</div>

<!-- Spinner shows while setting up data dir -->
<Spinner
  show={showLoading}
  header="Just a moment..."
  text="We're setting up your data"
/>

<!-- Error shows if error occurs with setup -->
<Error
  show={errorText !== ''}
  header="Oh no!"
  text={errorText}
  onclose={() => {
    errorText = '';
  }}
/>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  main {
    margin: 20px;
  }

  form {
    margin: 0 10%;
  }

  form input {
    width: 100%;
    height: 2em;
    border-radius: 5px;
    border-style: solid;
  }

  form input[type='submit'] {
    font-size: 1rem;
    font-weight: bold;
  }
</style>
