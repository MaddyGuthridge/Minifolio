<script lang="ts">
  import { Marked, Renderer, type Tokens } from 'marked';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/stackoverflow-light.css';
  // Custom heading IDs using `{#id}` after heading text
  import customHeadingId from 'marked-custom-heading-id';
  // GitHub-flavoured Markdown, automatic heading IDs
  import { gfmHeadingId } from 'marked-gfm-heading-id';
  // Smartypants quotation marks and the like
  import { markedSmartypantsLite } from 'marked-smartypants-lite';

  type Props = {
    source: string,
    article?: boolean,
  };

  const { source, article = false }: Props = $props();

  // https://github.com/markedjs/marked/discussions/2982#discussioncomment-6979586
  const renderer = {
    link(options: Tokens.Link) {
      const link = Renderer.prototype.link.call(this, options);
      // Only make links open in a new tab if they point to a different page
      if (options.href.startsWith('#')) {
        return link;
      } else {
        return link.replace('<a', "<a target='_blank' rel='noreferrer' ");
      }
    },
  };

  // Specifically instantiate a new `Marked` instance to avoid exceeding the call stack
  const marked = new Marked(
    gfmHeadingId(),
    customHeadingId(),
    markedSmartypantsLite(),
    { renderer },
  );

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
  const rendered = $derived(marked.parse(source));
  $effect(() => {
    if (rendered && markdownRender) {
      applySyntaxHighlighting(markdownRender);
    }
  });
</script>

<div
  class="markdown-render"
  style={article
    ? `
        max-width: 800px;
        font-family: Garamond, serif;
      `
    : `
        max-width: 1000px;
      `}
  bind:this={markdownRender}
>
  <!--
    We only render markdown specifically from the `data/` directory, so
    this is safe.
  -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html rendered}
</div>

<style>
  /* Better text readability */
  .markdown-render {
    /* Larger font size */
    font-size: 1.2rem;
    color: #111;
    /* Paragraph spacing */
    line-height: 1.5;
    /* Prevent overflow */
    width: 100%;
  }
  .markdown-render :global(p) {
    /* Justify text */
    text-align: justify;
    /* Hyphenate text in paragraphs if needed */
    hyphens: auto;
  }

  .markdown-render :global(h1),
  .markdown-render :global(h2),
  .markdown-render :global(h3) {
    /* Less spacing on headings */
    line-height: 1.2;
  }

  /* Make images fit in their allocated space */
  .markdown-render :global(img) {
    width: 100%;
    border-radius: 10px;
  }

  /*
    Inline code

    It's pretty annoying needing to select all of these manually so many times. I wonder if there's
    a better way...
  */
  .markdown-render :global(p code),
  .markdown-render :global(ol code),
  .markdown-render :global(ul code) {
    padding: 2px 5px;
    border-radius: 3px;
  }
  .markdown-render :global(p code),
  .markdown-render :global(ol code),
  .markdown-render :global(ul code),
  .markdown-render :global(pre) {
    background-color: rgb(245, 245, 245);
    border-color: rgb(231, 231, 231);
    border-style: solid;
    border-width: 1px;
    /* Kinda bold but not obnoxiously so */
    font-weight: 600;
  }
  /* Code blocks */
  .markdown-render :global(pre) {
    padding: 1em;
    border-radius: 5px;
    line-height: 1.2;
  }
  /*
    hljs adds its own padding in the themes which conflicts with our own definitions, causing
    annoying visual glitches.
  */
  .markdown-render :global(pre code.hljs) {
    padding: 0 !important;
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

  /*
    Table formatting
    https://www.w3schools.com/css/css_table.asp
    https://stackoverflow.com/a/3084318/6335363
  */
  /* Borders */
  .markdown-render :global(table),
  .markdown-render :global(th),
  .markdown-render :global(td) {
    border: 1px solid #00000040;
    border-collapse: collapse;
  }
  /* Padding around cells */
  .markdown-render :global(th),
  .markdown-render :global(td) {
    padding: 5px;
  }
  /* Color alternating lines */
  .markdown-render :global(tr:nth-child(even)) {
    background-color: #00000010;
  }
  /* Extra emphasis for headings */
  .markdown-render :global(th) {
    padding: 5px 15px;
    background-color: #00000010;
    font-size: large;
  }

  /*
    Make links not have an underline unless hovered.

    This is disabled when high contrast is enabled, which improves visibility.
  */
  @media not (prefers-contrast) {
    .markdown-render :global(a) {
      text-decoration: none;
    }
    .markdown-render :global(a):hover {
      text-decoration: underline;
    }
  }

  /*
    YouTube embeds:
    - Force 16:9 aspect ratio
    - Override provided width and height
  */
  :global(iframe[title="YouTube video player"]) {
    aspect-ratio: 16 / 9 !important;
    max-width: 100%;
    width: 500px !important;
    height: auto !important;
  }
</style>
