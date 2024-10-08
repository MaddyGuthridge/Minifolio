<script lang="ts">
  import { dev } from "$app/environment";
  import api from "$endpoints";
  import Paper from "$components/Paper.svelte";
  import Background from "$components/Background.svelte";
  import Spinner from "$components/modals/Spinner.svelte";
  import Error from "$components/modals/Error.svelte";
  import { goto } from "$app/navigation";
  import Navbar from "$components/navbar";
  import blankConfig from "$lib/blankConfig";
  import consts from "$lib/consts";
  import { idValidatorRegex } from "$lib/validators";

  // Default values are auto-filled in dev mode
  let username = dev ? "admin" : "";
  let password = dev ? "abc123ABC!" : "";
  let repeatPassword = dev ? "abc123ABC!" : "";
  let repoUrl = dev ? "git@github.com:MaddyGuthridge/portfolio-data.git" : "";
  let repoBranch = "";

  async function submitMain() {
    showLoading = true;
    try {
      await api().admin.firstrun(
        username,
        password,
        repoUrl,
        repoBranch || undefined,
      );
      await goto("/");
    } catch (e) {
      errorText = `${e}`;
      showLoading = false;
    }
  }

  async function submitNoGit() {
    try {
      await api().admin.firstrun(username, password);
      await goto("/");
    } catch (e) {
      errorText = `${e}`;
    }
  }

  async function onSubmit(e: SubmitEvent) {
    // Validate passwords match
    if (password !== repeatPassword) {
      errorText = "Passwords must match";
      return;
    }
    const submitter = e.submitter?.id;
    switch (submitter) {
      case "submit-main":
        await submitMain();
        break;
      case "submit-no-git":
        await submitNoGit();
        break;
      default:
        console.error("Submitter not recognised!");
        return;
    }
  }

  let showLoading = false;

  let errorText = "";
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

<Navbar config={blankConfig} loggedIn={undefined} path={[]} />

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

      <form on:submit={onSubmit}>
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
        <input
          type="text"
          id="repo-url"
          bind:value={repoUrl}
          placeholder="git@github.com:MaddyGuthridge/portfolio-data.git"
        />

        <h3>Repository branch</h3>
        <p>If you want to use a specific branch, you can enter it here.</p>
        <input
          type="text"
          id="repo-branch"
          bind:value={repoBranch}
          placeholder="main"
        />

        <h3>Ready to get started?</h3>
        <input type="submit" id="submit-main" value="Let's go!" />

        <h3>Don't want to use a git repo?</h3>
        <p>
          Using a git repo is a great idea if you want your data to be safely
          backed up. But if you're just testing {consts.APP_NAME}, it's much
          quicker to get started without a git repo.
        </p>
        <input
          type="submit"
          id="submit-no-git"
          value="I don't want to use git"
        />
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
  show={errorText !== ""}
  header="Oh no!"
  text={errorText}
  on:close={() => {
    errorText = "";
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

  form input[type="submit"] {
    font-size: 1rem;
    font-weight: bold;
  }
</style>
