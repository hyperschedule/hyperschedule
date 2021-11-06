<script lang='ts'>

import {apiData} from '../lib/app/local';
import CourseRow from '../components/CourseRow.svelte';

export let keys: string[] = [];

$: console.log(keys);

</script>

<div id="search-results">
  <div class="spacer"></div>
  {#if $apiData === null}
    <footer>Loading course data...</footer>
  {:else}
    <ul>
      {#each keys as key}
        <li><CourseRow course={$apiData.data.courses[key]}/></li>
      {/each}
    </ul>
  {/if}
  <div class="measure"></div>
</div>
