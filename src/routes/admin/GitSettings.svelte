<script lang="ts">
  import { Button, TextInput } from '$components/base';
  import { SpinnerButton } from '$components/base/button';
  import api from '$endpoints';

  type Props = {
    data: import('./$types').PageData;
  };

  let { data }: Props = $props();

  // Git status
  let gitStatus = $state(data.repo);

  // Git setup
  let gitUrl = $state('');

  async function submitSwitchToGit() {
    gitStatus = await api().admin.git.init(gitUrl);
  }

  // Git controls
  let commitMessage = $state('');

  let actionRunning: string | null = $state(null);

  async function gitCommit() {
    actionRunning = 'commit';
    gitStatus = await api().admin.git.commit(commitMessage);
    actionRunning = null;
  }
  async function gitPull() {
    actionRunning = 'pull';
    gitStatus = await api().admin.git.pull();
    actionRunning = null;
  }
  async function gitPush() {
    actionRunning = 'push';
    gitStatus = await api().admin.git.push();
    actionRunning = null;
  }

  async function updateGitConfig() {
    if (data.gitConfig.userName === '') {
      data.gitConfig.userName = null;
    }
    if (data.gitConfig.userEmail === '') {
      data.gitConfig.userEmail = null;
    }
    await api().admin.git.config.post(data.gitConfig);
  }
</script>

<div>
  <h2>Git config</h2>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void updateGitConfig();
    }}
  >
    <TextInput bind:value={data.gitConfig.userName} placeholder="user.name" />
    <TextInput
      bind:value={data.gitConfig.userEmail}
      type="email"
      placeholder="user.email"
    />
    <Button type="submit">Update</Button>
  </form>

  {#if gitStatus}
    <h2>Git status</h2>
    <p>Current branch: {gitStatus.branch}</p>
    <p>Current commit: {gitStatus.commit}</p>
    <p>
      {#if gitStatus.behind}
        {gitStatus.behind} commits behind.
      {/if}
      {#if gitStatus.ahead}
        {gitStatus.ahead} commits ahead.
      {/if}
    </p>

    <!-- Push/pull -->
    {#if gitStatus.behind}
      <SpinnerButton onclick={gitPull} running={actionRunning === 'pull'}>
        Pull
      </SpinnerButton>
    {:else if gitStatus.ahead}
      <SpinnerButton onclick={gitPush} running={actionRunning === 'push'}>
        Push
      </SpinnerButton>
    {/if}

    <!-- Commit -->
    {#if gitStatus.clean}
      <h3>Changes</h3>
      Working tree clean.
    {:else}
      <h3>Changes</h3>

      <ul>
        {#each gitStatus.changes as change}
          {#if change.from}
            <li>Rename {change.from} to ({change.path})</li>
          {:else if change.index === '?'}
            <li>Create {change.path}</li>
          {:else if change.index === 'D'}
            <li>Delete {change.path}</li>
          {:else}
            <li>Update {change.path}</li>
          {/if}
        {/each}
      </ul>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          void gitCommit();
        }}
      >
        <TextInput
          required
          name="commit-message"
          id="commit-message"
          placeholder="Commit message"
          bind:value={commitMessage}
        />
        <SpinnerButton type="submit" running={actionRunning === 'commit'}>
          Commit changes
        </SpinnerButton>
      </form>
    {/if}
  {:else}
    <h2>Git is currently not in use</h2>

    You can use a Git repository to back up your portfolio data. Enter the clone
    URL for an empty Git repository and it will be set up for you.

    <form
      onsubmit={(e) => {
        e.preventDefault();
        void submitSwitchToGit();
      }}
    >
      <TextInput
        required
        name="git-url"
        id="git-url"
        placeholder="git@github.com:MaddyGuthridge/Minifolio.git"
        bind:value={gitUrl}
      />
      <Button type="submit">Switch to a Git repository</Button>
    </form>
  {/if}
</div>
