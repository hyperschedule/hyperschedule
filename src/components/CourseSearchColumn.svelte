<script lang="ts">
  import SearchResults from "../components/SearchResults.svelte";
</script>

<div id="course-search-column">
  <div id="course-search-bar" class="toolbar px-4">
    <input
      type="text"
      id="course-search-course-name-input"
      class="form-control"
      placeholder="Search by name, course code, etc."
    />
    <div id="filter-button-wrapper" class="dropdown flex">
      <button class="icon" id="filter-button">
        <i class="las la-filter" />
      </button>
      <ul class="dropdown-menu dropdown-menu-right checkbox-menu allow-focus">
        <li>
          <label id="closed-courses-toggle-label">
            <input id="closed-courses-toggle" type="checkbox" /> Show closed courses
          </label>
        </li>
        <li>
          <label id="all-conflicting-courses-toggle-label">
            <input id="all-conflicting-courses-toggle" type="checkbox" />
            Hide courses conflicting with schedule
          </label>
        </li>
        <li>
          <label id="star-conflicting-courses-toggle-label">
            <input id="star-conflicting-courses-toggle" type="checkbox" />
            Hide courses conflicting with starred courses
          </label>
        </li>
      </ul>
    </div>

    <button type="button" id="help-button" class="icon">
      <i class="las la-question-circle" />
    </button>
  </div>
  <SearchResults />
</div>
