<script lang="ts">
  import { marked } from 'marked';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/stackoverflow-light.css';

  type Props = {
    source: string;
  };

  let { source }: Props = $props();

  // https://github.com/markedjs/marked/discussions/2982#discussioncomment-6979586
  const renderer = {
    link(href: string, title: string | null | undefined, text: string) {
      const link = marked.Renderer.prototype.link.call(this, href, title, text);
      return link.replace('<a', "<a target='_blank' rel='noreferrer' ");
    },
  };
  marked.use({ renderer });

  let markdownRender: HTMLDivElement | undefined = $state();

  function applySyntaxHighlighting(renderElement: HTMLDivElement) {
    // Wait a moment before we highlight so that we can be sure the HTML has
    // updated
    // This is honestly pretty gross but I haven't been able to find a better
    // way, since the contents of the div change after the call to this
    // function when we just subscribe to what their contents are supposed to
    // be
    setTimeout(() => {
      renderElement.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el as HTMLElement);
      });
    });
  }
  let rendered = $derived(marked(source));
  $effect(() => {
    if (rendered && markdownRender) {
      applySyntaxHighlighting(markdownRender);
    }
  });
</script>

<div class="markdown-render" bind:this={markdownRender}>
  <!--
    We only render markdown specifically from the `data/` directory, so
    this is safe.
  -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html rendered}
</div>

<style>
  .markdown-render :global(p) {
    text-align: justify;
  }

  .markdown-render :global(p > code),
  .markdown-render :global(pre) {
    background-color: rgb(245, 245, 245);
    padding: 2px 5px;
    border-radius: 3px;
    border-color: rgb(231, 231, 231);
    border-style: solid;
    border-width: 1px;
    /* Kinda bold but not obnoxiously so */
    font-weight: 600;
  }
  /* Override the background colour from code highlighting */
  .markdown-render :global(code) {
    background-color: rgb(245, 245, 245);
  }

  .markdown-render :global(pre > code) {
    padding: 1em;
  }

  /*
    Pretty block-quotes
    Source: https://css-tricks.com/snippets/css/simple-and-nice-blockquote-styling/
  */
  .markdown-render :global(blockquote) {
    background: #f9f9f973;
    border-left: 5px solid #ccccccc2;
    margin: 1.5em 10px;
    padding: 0.5em 10px;
  }
  .markdown-render :global(blockquote:before) {
    color: #ccccccc2;
    content: '\201C';
    font-size: 4em;
    line-height: 0.1em;
    margin-right: 0.25em;
    vertical-align: -0.4em;
  }
  .markdown-render :global(blockquote p) {
    display: inline;
  }

  .markdown-render :global(a) {
    text-decoration: none;
  }
  .markdown-render :global(a):hover {
    text-decoration: underline;
  }
</style>
