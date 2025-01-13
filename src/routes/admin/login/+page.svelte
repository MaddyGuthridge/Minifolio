<script lang="ts">
  import api from '$endpoints';
  import Background from '$components/Background.svelte';
  import Navbar from '$components/navbar/Navbar.svelte';
  import Paper from '$components/Paper.svelte';
  import { goto } from '$app/navigation';
  import consts from '$lib/consts';
  import { onMount } from 'svelte';

  type Props = {
    data: import('./$types').PageData;
  };

  let { data }: Props = $props();

  let previousPage: string;

  let username = $state('');
  let password = $state('');

  onMount(() => {
    previousPage =
      new URLSearchParams(window.location.search).get('from') ?? '/';
    // Avoid circular redirects
    if (previousPage.endsWith('/admin/login')) {
      previousPage = '/';
    }
  });

  async function doLogin() {
    await api().admin.auth.login(username, password);
    // TODO: Cleanly handle and display errors
    await goto(previousPage);
  }
</script>

<svelte:head>
  <title>login - {data.portfolio.info.name}</title>
  <meta name="generator" content={consts.APP_NAME} />
  <meta name="theme-color" content={data.portfolio.info.color} />
  <!-- Prevent web crawlers from indexing the admin page -->
  <meta name="robots" content="noindex" />
</svelte:head>

<Background color={data.portfolio.info.color}></Background>

<Navbar
  data={data.portfolio}
  loggedIn={false}
  path={[
    { txt: 'Admin', url: 'admin' },
    { txt: 'Login', url: 'login' },
  ]}
/>

<div class="center">
  <Paper>
    <main>
      <div class="center">
        <h1 style="font-size: 3rem">Login</h1>
      </div>

      <form>
        <h3>Username</h3>
        <input
          type="text"
          id="username"
          bind:value={username}
          placeholder="Username"
        />

        <h3>Password</h3>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="Your complex and secure password"
        />
        <p></p>
        <input
          type="submit"
          id="submit-main"
          value="Log in"
          onclick={doLogin}
        />
      </form>
    </main>
  </Paper>
</div>

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
