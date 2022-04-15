<script>
  import Sidebar from "../components/Sidebar.svelte";
  import CourseSearchColumn from "../components/CourseSearchColumn.svelte";
  import ScheduleColumn from "../components/ScheduleColumn.svelte";
  import Modals from "../components/Modals.svelte";
  import { onMount } from "svelte";

  import * as Store from "svelte/store";

  let scheduleTabSelected = false;

  onMount(() => {
    //import("../js/hyperschedule.ts");
  });
</script>

<div id="motd" />
<main>
  <div id="course-search-schedule-column">
    <div class="toolbar pt-4 px-4">
      <button
        id="course-search-toggle"
        class="btn"
        class:active={!scheduleTabSelected}
        on:click={() => void (scheduleTabSelected = false)}
      >
        Course Search
      </button>
      <button
        id="schedule-toggle"
        class="btn"
        class:active={scheduleTabSelected}
        on:click={() => void (scheduleTabSelected = true)}
      >
        Schedule
      </button>
      <button id="sidebar-open">
        <i class="las la-list" />
      </button>
    </div>
    <CourseSearchColumn hidden={scheduleTabSelected} />
    <div class="tab" class:hidden={!scheduleTabSelected}>
      <ScheduleColumn />
    </div>
  </div>

  <div id="sidebar-overlay" />

  <Sidebar />

  <div id="modal-layer"><Modals /></div>
</main>

<!--script src="https://unpkg.com/ionicons@5.4.0/dist/ionicons.js"></script-->
<!-- curl -s <src> | shasum -a 384 | cut -f1 -d' ' | xxd -r -p | base64 | sed 's/.*/integrity="sha384-&"/' -->

<!--if condition="ANALYTICS">
  <script
    src="https://cdn.usefathom.com/script.js"
    site="SNRUMQQA"
    defer></script>
</if-->
<style lang="postcss" global>
  //@import "../css/main.pcss";
  //@import "../css/course.pcss";

  button.active {
    //@apply outline-none;
    //@apply bg-blue-500;
    //@apply text-white;
  }
</style>
