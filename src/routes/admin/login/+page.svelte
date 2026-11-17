<script lang="ts">
  import api from '#lib/endpoints/index.ts';
  import Background from '#lib/components/Background.svelte';
  import Navbar from '#lib/components/navbar/Navbar.svelte';
  import Paper from '#lib/components/Paper.svelte';
  import { goto } from '$app/navigation';
  import consts from '#lib/consts.ts';
  import { onMount } from 'svelte';
  import { Button, TextInput } from '#lib/components/base/index.ts';
  import Favicon from '#lib/components/Favicon.svelte';
  import { reportError } from '#lib/ui/toast/index.ts';
  import { dev } from '$app/env';
  import devConsts from '#lib/devConsts.ts';

  type Props = {
    data: import('./$types').PageData,
  };

  const { data }: Props = $props();

  let previousPage: string;

  let username = $state(dev ? devConsts.defaultUsername : '');
  let password = $state(dev ? devConsts.defaultPassword : '');

  onMount(() => {
    previousPage = new URLSearchParams(window.location.search).get('from') ?? '/';
    // Avoid circular redirects
    if (previousPage.endsWith('/admin/login')) {
      previousPage = '/';
    }
  });

  async function doLogin() {
    await reportError(async () => {
      await api().admin.auth.login(username, password);
      await goto(previousPage);
    }, 'Unable to log in');
  }
</script>

<svelte:head>
  <title>Login - {data.portfolio.info.name}</title>
  <meta name="generator" content={consts.APP_NAME} />
  <meta name="theme-color" content={data.portfolio.info.color} />
  <Favicon path={data.config.siteIcon ?? undefined} />
  <!-- Prevent web crawlers from indexing the login page -->
  <meta name="robots" content="noindex" />
</svelte:head>

<Background color={data.portfolio.info.color} />

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
        <h1 style:font-size="3rem">Login</h1>
      </div>
      {#if dev}
        <p>Values are auto-filled in dev mode.</p>
      {/if}

      <form>
        <h3>Username</h3>
        <TextInput id="username" bind:value={username} placeholder="Username" />

        <h3>Password</h3>
        <TextInput
          type="password"
          id="password"
          bind:value={password}
          placeholder="Your complex and secure password"
        />
        <p>
          <Button type="submit" id="submit-main" onclick={doLogin}>
            Log in
          </Button>
        </p>
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
</style>
