<script lang="ts">
  import { Card } from '.';

  type Props = {
    /** Title to use for the card */
    title: string,
    /** Link behavior options */
    link?: { url: string, newTab: boolean },
    /** Hex color to use for the card */
    color: string,
    /** Callback for when the element is clicked */
    onclick?: (e: MouseEvent | undefined | null) => void,
    /** Icon to use */
    icon?: import('svelte').Snippet,
  };

  const { title, link, color, icon, onclick }: Props = $props();
</script>

<!--
@component

A card containing information about a Minifolio group.
-->

<Card {link} {color} {onclick}>
  <span>
    <div class="icon-div">
      {@render icon?.()}
    </div>
    <h3>{title}</h3>
  </span>
</Card>

<style>
  span {
    display: flex;
    gap: 10px;
    align-items: center;
    height: 100%;
  }

  .icon-div {
    font-size: 3em;
  }
</style>
