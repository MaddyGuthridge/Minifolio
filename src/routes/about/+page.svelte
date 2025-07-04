<script lang="ts">
  import Background from '$components/Background.svelte';
  import Markdown from '$components/markdown/Markdown.svelte';
  import consts from '$lib/consts';
  import { dev, version } from '$app/environment';
  import Navbar from '$components/navbar/Navbar.svelte';
  import Favicon from '$components/Favicon.svelte';

  type Props = {
    data: import('./$types').PageData;
  };

  const { data }: Props = $props();

  const versionInfo = dev
    ? `v${version} - dev`
    : `[v${version}](${consts.APP_GITHUB}/releases/tag/v${version})`;

  const authorLink = `[${consts.APP_AUTHOR[0]}](${consts.APP_AUTHOR[1]})`;

  const contributors = consts.APP_CONTRIBUTORS.length
    ? `Thanks to the contributors:\n\n${consts.APP_CONTRIBUTORS.map((c) => `* [${c[0]}](${c[1]})`).join('\n')}`
    : "I'd love to have your contributions!";

  const mainInfo = `
# About ${consts.APP_NAME} (${versionInfo})

This portfolio website is driven by [${consts.APP_NAME}](${consts.APP_DOCS}), a
[free and open-source](https://en.wikipedia.org/wiki/Free_and_open-source_software)
portfolio-oriented content management system made with <3 by
${authorLink}.

${contributors}

Here's how you can help out:

* [Learn how to deploy your own instance of ${consts.APP_NAME}](${consts.APP_DOCS}/deploy).
* [View the source code on GitHub](${consts.APP_GITHUB}).
* [Contribute code or documentation to ${consts.APP_NAME}](${consts.APP_DOCS}/contributing).
* [View the GPLv3 software license](${consts.APP_GITHUB}/blob/main/LICENSE.md).
`;

  let technicalDetails = '';
  if (data.versions) {
    technicalDetails = `

## Technical details

For security reasons, these details are only shown if you are logged in.

* Node: ${data.versions.node}
* OS: ${data.versions.os}
`;
  }

  const readme = mainInfo + technicalDetails;
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
<Background color={data.portfolio.info.color} />

<main>
  <div>
    <Markdown source={readme} />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  main > div {
    max-width: 800px;
    padding: 20px;
  }
</style>
