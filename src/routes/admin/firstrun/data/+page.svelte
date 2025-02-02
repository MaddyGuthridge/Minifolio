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
  import KeySettings from '../../KeySettings.svelte';
  import { Button, TextInput } from '$components/base';
  import itemId from '$lib/itemId';

  let { data } = $props();

  // Default values are auto-filled in dev mode
  let repoUrl = $state(
    dev ? 'git@github.com:MaddyGuthridge/portfolio-data.git' : '',
  );
  let repoBranch = $state('');

  async function submitMain() {
    showLoading = true;
    try {
      await api().admin.firstrun.data(repoUrl, repoBranch || undefined);
      await goto('/');
    } catch (e) {
      errorText = `${e}`;
      showLoading = false;
    }
  }

  async function submitNoGit() {
    try {
      await api().admin.firstrun.data();
      await goto('/');
    } catch (e) {
      errorText = `${e}`;
    }
  }

  async function onSubmit(e: SubmitEvent) {
    const submitter = e.submitter?.id;
    switch (submitter) {
      case 'submit-main':
        await submitMain();
        break;
      case 'submit-no-git':
        await submitNoGit();
        break;
      default:
        console.error('Submitter not recognised!');
        return;
    }
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
        {#if dev}
          <p>Values are auto-filled in dev mode.</p>
        {/if}
      </div>

      <div class="main-content">
        <KeySettings publicKey={data.publicKey} privateKeyPath={data.keyPath} />

        <form onsubmit={onSubmit}>
          <h3>Data repository URL</h3>
          <p>
            It's a good idea to set up a repository to back up your portfolio
            data.
            <a
              href="https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository"
              target="_blank">Create an empty git repository</a
            >
            and enter the clone URL here. If you want to import existing data, enter
            your existing repository URL here.
          </p>
          <TextInput
            id="repo-url"
            bind:value={repoUrl}
            placeholder="git@github.com:MaddyGuthridge/portfolio-data.git"
          />

          <h3>Repository branch</h3>
          <p>If you want to use a specific branch, you can enter it here.</p>
          <TextInput
            id="repo-branch"
            bind:value={repoBranch}
            placeholder="main"
          />

          <h3>Ready to get started?</h3>
          <Button type="submit" id="submit-main" mode="confirm">
            Let's go!
          </Button>

          <h3>Don't want to use a git repo?</h3>
          <p>
            Using a git repo is a great idea if you want your data to be safely
            backed up. But if you're just testing {consts.APP_NAME}, it's much
            quicker to get started without a git repo.
          </p>
          <Button type="submit" id="submit-no-git">
            I don't want to use git
          </Button>
        </form>
      </div>
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

  .main-content {
    margin: 0 10%;
  }
</style>
