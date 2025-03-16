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
  import { Button, TextInput } from '$components/base';
  import validate from '$lib/validate';
  import { objectAll } from '$lib/util';
  import itemId from '$lib/itemId';
  import Favicon from '$components/Favicon.svelte';
  import devConsts from '$lib/devConsts';

  // Default values are auto-filled in dev mode
  let username = $state(dev ? devConsts.defaultUsername : '');
  let password = $state(dev ? devConsts.defaultPassword : '');
  let repeatPassword = $state(dev ? devConsts.defaultPassword : '');

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

  // Values are true only in dev mode
  const valuesOk = $state({
    username: dev,
    password: dev,
    repeatPassword: dev,
  });

  const canSubmit = $derived(objectAll(valuesOk));
</script>

<svelte:head>
  <title>Setup - {consts.APP_NAME}</title>
  <meta name="generator" content={consts.APP_NAME} />
  <meta name="theme-color" content={blankData.info.color} />
  <Favicon />
  <!--
    Prevent web crawlers from indexing the firstrun page. Of course, if someone
    has an instance of this exposed to the open web without it being set up,
    that's absolutely on them, but the least we can do is stop instances that
    aren't set up from being easily searchable.
  -->
  <meta name="robots" content="noindex" />
</svelte:head>

<Background color={blankData.info.color}></Background>

<Navbar
  data={blankData}
  loggedIn={undefined}
  path={itemId.ROOT}
  lastItem={blankData}
/>

<div class="center">
  <Paper>
    <main>
      <div class="center">
        <h1 style="font-size: 3rem">
          Welcome to your fancy new portfolio website!
        </h1>
        <h2>Let's get set up!</h2>
        <p>
          If you're stuck, check the
          <a href={`${consts.APP_DOCS}/getting-started`} target="_blank">setup guide</a>.
        </p>
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
        <TextInput
          id="username"
          placeholder="username"
          bind:value={username}
          validator={(u) => validate.id('Username', u)}
          bind:valueOk={valuesOk.username}
        />

        <p>Create a strong and unique password.</p>
        <TextInput
          type="password"
          id="password"
          placeholder="A strong and unique password"
          bind:value={password}
          validator={validate.password}
          bind:valueOk={valuesOk.password}
        />
        <p>Repeat your password.</p>
        <TextInput
          type="password"
          id="repeatPassword"
          placeholder="Repeat your password"
          bind:value={repeatPassword}
          errorText={password !== repeatPassword
            ? 'Password fields must match'
            : undefined}
          bind:valueOk={valuesOk.repeatPassword}
        />
        <Button type="submit" id="submit-main" disabled={!canSubmit}>
          Create account
        </Button>
      </form>
    </main>
  </Paper>
</div>

<!-- Spinner shows while setting up data dir -->
<Spinner
  show={showLoading}
  header="Just a moment..."
  text="We're setting up your account"
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
</style>
