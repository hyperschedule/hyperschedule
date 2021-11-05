<script lang="ts">
  import CourseDetails from "../components/CourseDetails.svelte";
</script>

<div id="selected-courses-column">
  <div id="selected-courses-bar" class="toolbar">
    <button id="sidebar-close">
      <i class="las la-times" />
    </button>
    <button id="import-export-data-button" class="btn btn-primary">
      Import/Export Data
    </button>
    <div id="print-dropdown-wrapper">
      <button id="print-dropdown" class="icon">
        <i class="las la-print" />
      </button>
      <ul>
        <li class="print-btn" id="print-button-all">Print All</li>
        <li class="print-btn" id="print-button-starred">Print Starred</li>
      </ul>
    </div>
    <button type="button" id="settings-button" class="icon">
      <i class="las la-cog" />
    </button>
    <a
      href="https://github.com/MuddCreates/hyperschedule"
      title="View on GitHub"
      class="icon"
    >
      <i class="lab la-github" />
    </a>
  </div>
  <CourseDetails />

  <div id="selected-courses-wrapper">
    <ul id="selected-courses-list" class="sortable-list courses-list" />
  </div>
</div>
