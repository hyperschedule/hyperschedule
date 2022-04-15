<script lang="ts">
  import { apiData } from "../lib/app/local";
  import CourseRow from "../components/CourseRow.svelte";

  export let keys: string[] = [];

  let rowHeight: number = 1;
  let viewportHeight: number = 1;
  let viewportOffset: number = 0;
  let viewport: HTMLDivElement;

  const scroll = () => (viewportOffset = viewport.scrollTop);

  $: start = Math.floor(
    Math.max(viewportOffset - viewportHeight, 0) / rowHeight
  );
  $: end = Math.ceil((viewportOffset + 2 * viewportHeight) / rowHeight);
</script>

<div
  id="search-results"
  bind:this={viewport}
  bind:clientHeight={viewportHeight}
  on:scroll={scroll}
>
  {#if $apiData === null}
    <footer>Loading course data...</footer>
  {:else}
    <div class="spacer" style="height: {rowHeight * keys.length}px" />
    <ul>
      {#each keys.slice(start, end) as key, i}
        <li class="slot" style="top: {(i + start) * rowHeight}px">
          <CourseRow course={$apiData.data.courses[key]} />
        </li>
      {/each}
    </ul>
  {/if}
  <div class="measure" bind:clientHeight={rowHeight}><CourseRow /></div>
</div>

<style lang="postcss">
  #search-results {
    @apply overflow-y-scroll relative;

    ul {
      .slot {
        @apply absolute top-0 w-full;
      }
    }

    .measure {
      @apply absolute top-0 invisible;
    }

    footer {
      @apply text-sm opacity-50 px-4 text-center;
    }
  }
</style>
