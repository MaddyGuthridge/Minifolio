<script lang="ts">
  import Markdown from '$components/markdown/Markdown.svelte';
  import consts from '$lib/consts';
  import { dev, version } from '$app/environment';
  import Navbar from '$components/navbar/Navbar.svelte';
  import Favicon from '$components/Favicon.svelte';
  import dedent from 'dedent';
  import Background from '$components/Background.svelte';

  type Props = {
    data: import('./$types').PageData,
  };

  const { data }: Props = $props();

  const authorLink = `[${consts.APP_AUTHOR[0]}](${consts.APP_AUTHOR[1]})`;

  const contributors = consts.APP_CONTRIBUTORS.length
    ? `Thanks to the contributors:\n\n${consts.APP_CONTRIBUTORS.map(c => `* [${c[0]}](${c[1]})`).join('\n')}`
    : "I'd love to have your contributions!";

  const mainInfo = `
This portfolio website is driven by [${consts.APP_NAME}](${consts.APP_DOCS}), a
[free and open-source](https://en.wikipedia.org/wiki/Free_and_open-source_software)
portfolio-oriented content management system made with <3 by
${authorLink}.

${contributors}

Here's how you can get involved:

* [Learn how to deploy your own instance of ${consts.APP_NAME}](${consts.APP_DOCS}/deploy).
* [View the source code on GitHub](${consts.APP_GITHUB}).
* [Contribute code or documentation to ${consts.APP_NAME}](${consts.APP_DOCS}/contributing).
* [View the GPLv3 software license](${consts.APP_GITHUB}/blob/main/LICENSE.md).
`;

  const technicalDetails = $derived(
    data.versions
      ? dedent`

      ## Technical details

      For security reasons, these details are only shown if you are logged in.

      * Node: ${data.versions.node}
      * OS: ${data.versions.os}
      `
      : '',
  );

  const readme = $derived(mainInfo + technicalDetails);
</script>

<svelte:head>
  <title>About {consts.APP_NAME}</title>
  <meta name="generator" content={consts.APP_NAME} />
  <meta name="theme-color" content={data.portfolio.info.color} />
  <Favicon path={data.siteIcon} />
</svelte:head>

<Navbar
  path={[{ url: 'about', txt: 'About' }]}
  data={data.portfolio}
  loggedIn={data.loggedIn}
/>

<main>
  <h1>Minifolio</h1>
  <div class="bg-container">
    <Background color={data.portfolio.info.color} position="relative" posUnits="px" spreadScale={30} />
  </div>
  {#if dev}
    <p>{`v${version}-dev`}</p>
  {:else}
    <p><a href={`${consts.APP_GITHUB}/releases/tag/v${version}`}>{`v${version}`}</a></p>
  {/if}
  <div class="md-container">
    <Markdown source={readme} />
  </div>
</main>

<style>
  h1 {
    font-size: 8rem;
    margin: 15px;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .bg-container {
    width: 0;
    height: 0;
    overflow: visible;
    position: relative;
    bottom: 10rem;
  }
  .md-container {
    max-width: 800px;
    padding: 20px;
  }
</style>
