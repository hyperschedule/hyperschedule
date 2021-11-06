<script lang="ts">
  import SearchResults from "../components/SearchResults.svelte";
  import {
    apiData,
    showClosedCourses,
    hideAllConflictingCourses,
    hideStarredConflictingCourses,
  } from "../lib/app/local";

  export let hidden: boolean;
  let query: string = "";

  const filterKeywords: Record<string, string[]> = {
    "dept:": ["dept:", "department:"],
    "college:": ["college", "col:", "school:", "sch:"],
    "days:": ["days:", "day:"],
  };

  function processSearchText(q: string) {
    const searchText = q.trim().split(/\s+/);
    let filterKeywordsValues: string[] = [];
    for (let key of Object.keys(filterKeywords)) {
      filterKeywordsValues = filterKeywordsValues.concat(filterKeywords[key]);
    }
    let filtersText = [];
    let queryText = [];

    for (let text of searchText) {
      text = text.toLowerCase();
      if (
        filterKeywordsValues.some((filter: string) => text.includes(filter))
      ) {
        filtersText.push(text);
      } else {
        queryText.push(text);
      }
    }

    const query = getSearchQuery(queryText);
    const filters = getSearchTextFilters(filtersText);

    return { query, filters };
  }

  function quoteRegexp(str: string) {
    return (str + "").replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }

  function getSearchQuery(searchTextArray: string[]) {
    return searchTextArray.map((subquery: string) => {
      return new RegExp(quoteRegexp(subquery), "i");
    });
  }

  function getSearchTextFilters(filtersTextArray: string[]) {
    let filter: Record<string, string> = {};
    for (let text of filtersTextArray) {
      let keyword = text.split(":")[0] + ":";
      const filterText = text.split(":")[1];
      if (!(keyword in Object.keys(filterKeywords))) {
        for (let key of Object.keys(filterKeywords)) {
          if (filterKeywords[key].includes(keyword)) {
            keyword = key;
            break;
          }
        }
      }
      filter[keyword] = filterText;
    }
    return filter;
  }

  function coursePassesTextFilters(
    course: Course.CourseV3,
    textFilters: Record<string, string>
  ) {
    const lowerCourseCode = course.courseCode.toLowerCase();
    const dept = lowerCourseCode.slice(0, 4).trim();
    const col = lowerCourseCode.split("-")[0].slice(-2);

    if (
      (textFilters["dept:"] && !dept.match(textFilters["dept:"])) ||
      (textFilters["college:"] && !col.match(textFilters["college:"])) ||
      (textFilters["days:"] &&
        !coursePassesDayFilter(course, textFilters["days:"]))
    ) {
      return false;
    }

    return true;
  }

  function courseMatchesSearchQuery(course: Course.CourseV3, query: RegExp[]) {
    for (let subquery of query) {
      if (
        course.courseCode.match(subquery) ||
        course.courseCode.replace(/ /g, "").match(subquery) ||
        course.courseName.match(subquery)
      ) {
        continue;
      }
      let foundMatch = false;
      if (course.courseInstructors !== null) {
        for (let instructor of course.courseInstructors) {
          if (instructor.match(subquery)) {
            foundMatch = true;
            break;
          }
        }
      }
      if (foundMatch) {
        continue;
      }
      return false;
    }
    return true;
  }

  function courseConflictWithSchedule(
    course: Course.CourseV3,
    starredOnly: boolean
  ) {
    const schedule = []; //computeSchedule(gSelectedCourses);

    for (let existingCourse of schedule) {
      if (
        (!starredOnly || existingCourse.starred === starredOnly) &&
        !Course.equal(existingCourse, course) &&
        Course.conflict(course, existingCourse)
      ) {
        return true;
      }
    }
    return false;
  }

  $: search = processSearchText(query);

  $: filteredCourseKeys =
    $apiData === null
      ? []
      : Object.keys($apiData.data.courses).filter((key) => {
          const course = $apiData!.data.courses[key];
          return (
            courseMatchesSearchQuery(course, search.query) &&
            coursePassesTextFilters(course, search.filters) &&
            ($showClosedCourses || !Course.isClosed(course)) &&
            (!$hideAllConflictingCourses ||
              !courseConflictWithSchedule(course, false)) &&
            (!$hideStarredConflictingCourses ||
              !courseConflictWithSchedule(course, true))
          );
        });
</script>

<div id="course-search-column" class:hidden>
  <div id="course-search-bar" class="toolbar px-4">
    <input
      type="text"
      id="course-search-course-name-input"
      class="form-control"
      placeholder="Search by name, course code, etc."
      bind:value={query}
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
  <SearchResults keys={filteredCourseKeys} />
</div>
