// To see the outline of this file from Emacs, run M-x
// outline-minor-mode and then press C-c @ C-t. To also show the
// top-level functions and variable declarations in each section, run
// M-x occur with the following query: ^\(///+\|const\|\(async \)?function\|let\)

/// Globals
//// Modules

const ics = require("/js/vendor/ics-0.2.0.min.js");

//// Data constants

const millisecondsPerHour = 3600 * 1000;

const courseSearchPageSize = 20;

const courseSearchPagesShownStart = 3;
const extraPagesToLoad = 2;

const apiURL = process.env.API_URL || "https://hyperschedule.herokuapp.com";

const greyConflictCoursesOptions = ["none", "starred", "all"];

const filterKeywords = {
  "dept:": ["dept:", "department:"],
  "college:": ["college", "col:", "school:", "sch:"],
  "days:": ["days:", "day:"]
};

filterInequalities = ["<=", ">=", "<", ">", "="];

//// DOM elements

const courseSearchToggle = document.getElementById("course-search-toggle");
const scheduleToggle = document.getElementById("schedule-toggle");

const closedCoursesToggle = document.getElementById("closed-courses-toggle");
const hideAllConflictingCoursesToggle = document.getElementById(
  "all-conflicting-courses-toggle"
);
const hideStarredConflictingCoursesToggle = document.getElementById(
  "star-conflicting-courses-toggle"
);

const courseSearchScheduleColumn = document.getElementById(
  "course-search-schedule-column"
);
const courseSearchColumn = document.getElementById("course-search-column");
const scheduleColumn = document.getElementById("schedule-column");

const courseSearchInput = document.getElementById(
  "course-search-course-name-input"
);
const courseSearchResults = document.getElementById("course-search-results");
const courseSearchResultsList = document.getElementById(
  "course-search-results-list"
);
const courseSearchResultsPlaceholder = document.getElementById(
  "course-search-results-placeholder"
);
const courseSearchResultsEnd = document.getElementById(
  "course-search-results-end"
);

const selectedCoursesColumn = document.getElementById(
  "selected-courses-column"
);
const importExportDataButton = document.getElementById(
  "import-export-data-button"
);
const printDropdown = document.getElementById("print-dropdown");
const printAllButton = document.getElementById("print-button-all");
const printStarredButton = document.getElementById("print-button-starred");
const settingsButton = document.getElementById("settings-button");

const conflictCoursesRadios = document.getElementsByName("conflict-courses");

const courseDescriptionMinimizeOuter = document.getElementById(
  "minimize-outer"
);
const courseDescriptionMinimize = document.getElementById(
  "course-description-minimize"
);
const minimizeIcon = document.getElementById("minimize-icon");
const courseDescriptionBox = document.getElementById("course-description-box");
const courseDescriptionBoxOuter = document.getElementById(
  "course-description-box-outer"
);

const selectedCoursesList = document.getElementById("selected-courses-list");
const createGroupButton = document.getElementById("create-group-button");

const scheduleTable = document.getElementById("schedule-table");
const scheduleTableBody = document.getElementById("schedule-table-body");
const creditCountText = document.getElementById("credit-count");

const importExportTextArea = document.getElementById("import-export-text-area");
const importExportICalButton = document.getElementById(
  "import-export-ical-button"
);
const importExportSaveChangesButton = document.getElementById(
  "import-export-save-changes-button"
);
const importExportCopyButton = document.getElementById(
  "import-export-copy-button"
);

//// Global state

// Persistent data.
let gGroupCounter = 0;
let gApiData = null;
let gNestedSelectedCoursesAndGroups = [];
let gSelectedCourses = [];
let gScheduleTabSelected = false;
let gShowClosedCourses = true;
let gHideAllConflictingCourses = false;
let gHideStarredConflictingCourses = false;
let gGreyConflictCourses = greyConflictCoursesOptions[0];

// Transient data.
let gCurrentlySorting = false;
let gCourseEntityHeight = 0;
let gFilteredCourseKeys = [];
let gFocusedGroupTextBox = null; // group text box currently being typed in
let gFocusedGroupTextBoxSelection = [0, 0]; // selected text in focused text box
// keeps track of function that checks for clicking anywhere but group naming
// box, so it can be deleted later
let gClickAwayFunction = null;

/// Utility functions
//// JavaScript utility functions

function isString(obj) {
  return typeof obj === "string" || obj instanceof String;
}

// Modulo operator, because % computes remainder and not modulo.
function mod(n, m) {
  let rem = n % m;
  if (rem < 0) {
    rem += m;
  }
  return rem;
}

// Convert YYYY-MM-DD to Date. Taken from
// https://stackoverflow.com/a/7151607/3538165.
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return new Date(year, month - 1, day);
}

// https://stackoverflow.com/a/2593661
function quoteRegexp(str) {
  return (str + "").replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

function arraysEqual(arr1, arr2, test) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let idx = 0; idx < arr1.length; ++idx) {
    if (test ? !test(arr1[idx], arr2[idx]) : arr1[idx] !== arr2[idx]) {
      return false;
    }
  }
  return true;
}

function compareArrays(arr1, arr2) {
  let idx1 = 0;
  let idx2 = 0;
  while (idx1 < arr1.length && idx2 < arr2.length) {
    if (arr1[idx1] < arr2[idx2]) {
      return -1;
    } else if (arr1[idx1] > arr2[idx2]) {
      return 1;
    } else {
      ++idx1;
      ++idx2;
    }
  }
  if (arr1.length < arr2.length) {
    return -1;
  } else if (arr1.length > arr2.length) {
    return 1;
  } else {
    return 0;
  }
}

// https://stackoverflow.com/a/29018745/3538165
function binarySearch(ar, el, compare_fn) {
  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
    var k = (n + m) >> 1;
    var cmp = compare_fn(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function formatList(list, none) {
  if (list.length === 0) {
    if (none === undefined) {
      return "(none)";
    } else {
      return none || "(none)";
    }
  } else if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return list[0] + " and " + list[1];
  } else {
    return (
      list.slice(0, list.length - 1).join(", ") +
      ", and " +
      list[list.length - 1]
    );
  }
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function weekdayCharToInteger(weekday) {
  const index = "UMTWRFS".indexOf(weekday);
  if (index < 0) {
    throw Error("Invalid weekday: " + weekday);
  }
  return index;
}

function readFromLocalStorage(key, pred, def) {
  const jsonString = localStorage.getItem(key);
  if (!jsonString) {
    return def;
  }
  try {
    const obj = JSON.parse(jsonString);
    if (pred(obj)) {
      return obj;
    } else {
      return def;
    }
  } catch (err) {
    return def;
  }
}

function catchEvent(event) {
  event.stopPropagation();
}

//// Time utility functions

function timeStringToHoursAndMinutes(timeString) {
  return [
    parseInt(timeString.substring(0, 2), 10),
    parseInt(timeString.substring(3, 5), 10)
  ];
}

function timeStringToHours(timeString) {
  const [hours, minutes] = timeStringToHoursAndMinutes(timeString);
  return hours + minutes / 60;
}

function timeStringTo12HourString(timeString) {
  let [hours, minutes] = timeStringToHoursAndMinutes(timeString);
  const pm = hours >= 12;
  hours -= 1;
  hours %= 12;
  hours += 1;
  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    " " +
    (pm ? "PM" : "AM")
  );
}

async function runWithExponentialBackoff(
  task,
  failureDelay,
  backoffFactor,
  fetchDesc
) {
  while (true) {
    console.log(`Attempting to ${fetchDesc}...`);
    try {
      await task();
      break;
    } catch (err) {
      console.error(err);
      console.log(`Trying again to ${fetchDesc} in ${failureDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, failureDelay));
      failureDelay *= backoffFactor;
    }
  }
}

//// DOM utility functions

function hideEntity(entity) {
  entity.classList.add("hidden");
}

function showEntity(entity) {
  entity.classList.remove("hidden");
}

function setEntityVisibility(entity, visible) {
  if (visible) {
    showEntity(entity);
  } else {
    hideEntity(entity);
  }
}

function setButtonSelected(button, selected) {
  const classAdded = selected ? "btn-primary" : "btn-light";
  const classRemoved = selected ? "btn-light" : "btn-primary";
  button.classList.add(classAdded);
  button.classList.remove(classRemoved);
}

function removeEntityChildren(entity) {
  while (entity.hasChildNodes()) {
    entity.removeChild(entity.lastChild);
  }
}

//// Course and schedule utility functions
///// Course property queries

function isCourseClosed(course) {
  return course.courseEnrollmentStatus == "closed";
}

function courseToString(course) {
  return (
    course.courseName +
    " (" +
    course.courseEnrollmentStatus +
    ", " +
    course.courseSeatsFilled +
    "/" +
    course.courseSeatsTotal +
    " seats filled)"
  );
}

function courseToInstructorLastnames(course) {
  return course.courseInstructors
    .map(fullName => fullName.split(",")[0])
    .join(",");
}

function coursesEqual(course1, course2) {
  return course1.courseCode === course2.courseCode;
}

function termListDescription(terms, termCount) {
  if (termCount > 10) {
    return "Complicated schedule";
  }

  if (termCount === 1) {
    return "Full-semester course";
  }

  const numbers = _.map(term => {
    switch (term) {
      case 0:
        return "first";
      case 1:
        return "second";
      case 2:
        return "third";
      case 3:
        return "fourth";
      case 4:
        return "fifth";
      case 5:
        return "sixth";
      case 6:
        return "seventh";
      case 7:
        return "eighth";
      case 8:
        return "ninth";
      case 9:
        return "tenth";
      default:
        return "unknown";
    }
  }, terms);

  const qualifier = (termCount => {
    switch (termCount) {
      case 2:
        return "half";
      case 3:
        return "third";
      case 4:
        return "quarter";
      case 5:
        return "fifth";
      case 6:
        return "sixth";
      case 7:
        return "seventh";
      case 8:
        return "eighth";
      case 9:
        return "ninth";
      case 10:
        return "tenth";
      default:
        return "unknown";
    }
  })(termCount);

  return _.capitalize(`${formatList(numbers)} ${qualifier}-semester course`);
}

function generateCourseDescription(course) {
  const description = [];

  const summaryLine = course.courseCode + " " + course.courseName;
  description.push(summaryLine);

  const times = course.courseSchedule.map(generateScheduleSlotDescription);
  for (const time of times) {
    description.push(time);
  }

  const instructors = formatList(course.courseInstructors);
  description.push(instructors);

  let partOfYear;
  if (_.isEmpty(course.courseSchedule)) {
    partOfYear = "No scheduled meetings";
  } else {
    const meeting = course.courseSchedule[0];
    partOfYear = termListDescription(
      meeting.scheduleTerms,
      meeting.scheduleTermCount
    );
  }
  const credits = parseFloat(course.courseCredits);
  const creditsString = credits + " credit" + (credits !== 1 ? "s" : "");
  description.push(`${partOfYear}, ${creditsString}`);

  if (course.courseDescription !== null) {
    description.push(course.courseDescription);
  }

  const enrollment =
    course.courseEnrollmentStatus.charAt(0).toUpperCase() +
    course.courseEnrollmentStatus.slice(1) +
    ", " +
    course.courseSeatsFilled +
    "/" +
    course.courseSeatsTotal +
    " seats filled";
  description.push(enrollment);

  return description;
}

function getCourseColor(course, format = "hex") {
  let hue = "random";
  let seed = CryptoJS.MD5(course.courseCode).toString();

  if (course.starred || !courseInSchedule(course)) {
    switch (gGreyConflictCourses) {
      case greyConflictCoursesOptions[0]:
        break;

      case greyConflictCoursesOptions[1]:
        if (courseConflictWithSchedule(course, true)) {
          hue = "monochrome";
          seed = "-10";
        }
        break;

      case greyConflictCoursesOptions[2]:
        if (courseConflictWithSchedule(course, false)) {
          hue = "monochrome";
          seed = "-10";
        }
        break;
    }
  }

  return getRandomColor(hue, seed, format);
}

function getRandomColor(hue, seed, format = "hex") {
  return randomColor({
    hue: hue,
    luminosity: "light",
    seed: seed,
    format
  });
}

///// Course search

function courseMatchesSearchQuery(course, query) {
  for (let subquery of query) {
    if (
      course.courseCode.match(subquery) ||
      course.courseCode.replace(/ /g, "").match(subquery) ||
      course.courseName.match(subquery)
    ) {
      continue;
    }
    let foundMatch = false;
    for (let instructor of course.courseInstructors) {
      if (instructor.match(subquery)) {
        foundMatch = true;
        break;
      }
    }
    if (foundMatch) {
      continue;
    }
    return false;
  }
  return true;
}

function coursePassesTextFilters(course, textFilters) {
  const lowerCourseCode = course.courseCode.toLowerCase();
  const dept = lowerCourseCode.split(" ")[0];
  const col = lowerCourseCode.split(" ")[2].split("-")[0];

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

function parseDaysInequality(inputDays) {
  for (const rel of filterInequalities)
    if (inputDays.startsWith(rel)) return rel;
  return "";
}

function generateDayFilter(course) {
  const scheduleList = course.courseSchedule;
  let days = new Set();

  for (let schedule of scheduleList) {
    const str1 = schedule.scheduleDays.toLowerCase();
    const arr1 = [...str1];
    arr1.forEach(days.add, days);
  }
  return days;
}

function generateInputDays(input) {
  let days = new Set();
  const arr1 = [...input];
  arr1.forEach(days.add, days);
  return days;
}

function coursePassesDayFilter(course, inputString) {
  const courseDays = generateDayFilter(course);
  const rel = parseDaysInequality(inputString);
  const inputDays = generateInputDays(
    inputString.substring(rel.length).toLowerCase()
  );

  switch (rel) {
    case "<=":
      // courseDays is a subset of inputDays
      return courseDays.subSet(inputDays);
    case "":
    case ">=":
      // inputDays is a subset of courseDays
      return inputDays.subSet(courseDays);
    case "=":
      // inputDays match exactly courseDays
      const difference1 = new Set(
        [...courseDays].filter(x => !inputDays.has(x))
      );
      const difference2 = new Set(
        [...inputDays].filter(x => !courseDays.has(x))
      );
      return difference1.size == 0 && difference2.size == 0;
    case "<":
      // courseDays is a proper subset of inputDays
      return courseDays.subSet(inputDays) && inputDays.size != courseDays.size;
    case ">":
      // inputDays is a proper subset of courseDays
      return inputDays.subSet(courseDays) && inputDays.size != courseDays.size;
    default:
      return false;
  }
}

Set.prototype.subSet = function(otherSet) {
  // if size of this set is greater
  // than otherSet then it can'nt be
  //  a subset
  if (this.size > otherSet.size) return false;
  else {
    for (var elem of this) {
      // if any of the element of
      // this is not present in the
      // otherset then return false
      if (!otherSet.has(elem)) return false;
    }
    return true;
  }
};

///// Course scheduling

function generateScheduleSlotDescription(slot) {
  return (
    slot.scheduleDays +
    " " +
    timeStringTo12HourString(slot.scheduleStartTime) +
    " – " +
    timeStringTo12HourString(slot.scheduleEndTime) +
    " at " +
    slot.scheduleLocation
  );
}

function coursesMutuallyExclusive(course1, course2) {
  return arraysEqual(
    course1.courseMutualExclusionKey,
    course2.courseMutualExclusionKey
  );
}

function coursesConflict(course1, course2) {
  for (let slot1 of course1.courseSchedule) {
    for (let slot2 of course2.courseSchedule) {
      const parts = math.lcm(slot1.scheduleTermCount, slot2.scheduleTermCount);
      if (
        !_.some(
          idx =>
            slot1.scheduleTerms.indexOf(idx / slot2.scheduleTermCount) != -1 &&
            slot2.scheduleTerms.indexOf(idx / slot1.scheduleTermCount) != -1,
          _.range(0, parts)
        )
      ) {
        return false;
      }
      let daysOverlap = false;
      for (let day1 of slot1.scheduleDays) {
        if (slot2.scheduleDays.indexOf(day1) !== -1) {
          daysOverlap = true;
          break;
        }
      }
      if (!daysOverlap) {
        continue;
      }
      const start1 = timeStringToHours(slot1.scheduleStartTime);
      const end1 = timeStringToHours(slot1.scheduleEndTime);
      const start2 = timeStringToHours(slot2.scheduleStartTime);
      const end2 = timeStringToHours(slot2.scheduleEndTime);
      if (end1 <= start2 || start1 >= end2) {
        continue;
      } else {
        return true;
      }
    }
  }
  return false;
}

function courseConflictWithSchedule(course, starredOnly) {
  const schedule = computeSchedule(gSelectedCourses);

  for (let existingCourse of schedule) {
    if (
      (!starredOnly || existingCourse.starred === starredOnly) &&
      !coursesEqual(existingCourse, course) &&
      coursesConflict(course, existingCourse)
    ) {
      return true;
    }
  }
  return false;
}

function courseInSchedule(course) {
  const schedule = computeSchedule(gSelectedCourses);

  for (let existingCourse of schedule) {
    if (coursesEqual(existingCourse, course)) {
      return true;
    }
  }
  return false;
}

function computeSchedule(courses) {
  const schedule = [];
  for (let course of courses) {
    if (course.selected && course.starred) {
      schedule.unshift(course);
    }
  }
  for (let course of courses) {
    // We already took care of the starred courses up earlier.
    if (!course.selected || course.starred) {
      continue;
    }
    let conflicts = false;
    for (let existingCourse of schedule) {
      if (
        coursesMutuallyExclusive(course, existingCourse) ||
        coursesConflict(course, existingCourse)
      ) {
        conflicts = true;
        break;
      }
    }
    if (!conflicts) {
      schedule.push(course);
    }
  }
  return schedule;
}

/**
 * Given an array of integers in sorted order, determine the beginning
 * and end of each run of consecutive integers. For example:
 *
 * getConsecutiveRanges([0,1,2,4,5,8,10,12,13,14,15,20])
 *   => [[0,2], [4,5], [8,8], [10,10], [12,15], [20,20]]
 */
function getConsecutiveRanges(nums) {
  const groups = [];
  let group = [];
  _.forEach(([idx, num]) => {
    if (idx > 0 && nums[idx - 1] !== nums[idx] - 1) {
      groups.push(group);
      group = [];
    }
    group.push(num);
  }, _.entries(nums));
  groups.push(group);
  return _.map(group => [_.min(group), _.max(group)], groups);
}

///// Course schedule queries

function computeCreditCountDescription(schedule) {
  let totalCredits = 0;
  let starredCredits = 0;
  for (let course of schedule) {
    let credits = parseFloat(course.courseCredits);
    totalCredits += credits;
    if (course.starred) {
      starredCredits += credits;
    }
  }
  return (
    "Scheduled: " +
    totalCredits +
    " credit" +
    (totalCredits !== 1 ? "s" : "") +
    " (" +
    starredCredits +
    " starred)"
  );
}

//// Global state queries

function courseAlreadyAdded(course) {
  return _.some(selectedCourse => {
    return selectedCourse.courseCode === course.courseCode;
  }, gSelectedCourses);
}

/// API retrieval

async function retrieveAPI(endpoint) {
  const httpResponse = await fetch(apiURL + endpoint);
  if (!httpResponse.ok) {
    throw Error(
      `Received API error for endpoint ${endpoint}: ` +
        `${httpResponse.status} ${httpResponse.statusText}`
    );
  }
  return await httpResponse.json();
}

/// DOM manipulation
//// DOM setup

function attachListeners() {
  let ent = createCourseEntity("placeholder");
  courseSearchResultsList.appendChild(ent);
  gCourseEntityHeight = ent.clientHeight;
  courseSearchResultsList.removeChild(ent);

  courseSearchToggle.addEventListener("click", displayCourseSearchColumn);
  scheduleToggle.addEventListener("click", displayScheduleColumn);
  closedCoursesToggle.addEventListener("click", toggleClosedCourses);
  hideAllConflictingCoursesToggle.addEventListener(
    "click",
    toggleAllConflictingCourses
  );
  hideStarredConflictingCoursesToggle.addEventListener(
    "click",
    toggleStarredConflictingCourses
  );
  courseSearchInput.addEventListener("keyup", handleCourseSearchInputUpdate);
  importExportDataButton.addEventListener("click", showImportExportModal);
  importExportICalButton.addEventListener("click", downloadICalFile);
  importExportSaveChangesButton.addEventListener(
    "click",
    saveImportExportModalChanges
  );
  let sortableList = Sortable.create(selectedCoursesList, {
    handle: ".course-box-text",
    ghostClass: "placeholder",
    group: "courses",
    emptyInsertThreshold: 15,
    onSort: function(evt) {
      readSelectedCoursesList();
    },
    onStart: function(evt) {
      gCurrentlySorting = true;
    },
    onEnd: function(evt) {
      gCurrentlySorting = false;
    }
  });

  printAllButton.addEventListener("click", () => {
    downloadPDF(false);
  });
  printStarredButton.addEventListener("click", () => {
    downloadPDF(true);
  });
  settingsButton.addEventListener("click", showSettingsModal);

  courseDescriptionMinimize.addEventListener(
    "click",
    minimizeCourseDescription
  );
  selectedCoursesList.addEventListener("coursenametyping", () => {
    sortableList.option("disabled", true);
  });
  selectedCoursesList.addEventListener("coursenametypingdone", () => {
    sortableList.option("disabled", false);
  });

  createGroupButton.addEventListener("click", event => {
    // catch click so doesn't propagate to click away function in group
    catchEvent(event);
    createGroup();
  });

  courseSearchResults.addEventListener("scroll", rerenderCourseSearchResults);

  for (let i = 0; conflictCoursesRadios[i]; i++) {
    conflictCoursesRadios[i].addEventListener("click", () => {
      gGreyConflictCourses = greyConflictCoursesOptions[i];
      toggleConflictCourses();
    });
  }

  // DO NOT use Javascript size computations for ANYTHING ELSE!  The
  // _only_ reason we use Javascript to set the course description box
  // height is to leverage CSS transitions to animate the resizing of
  // the course description; in _all other cases_, especially for
  // static layout calculations, use CSS Flexbox!!!
  window.addEventListener("resize", updateCourseDescriptionBoxHeight);

  // Re-render virtualized list on viewport resizes.
  window.addEventListener("resize", rerenderCourseSearchResults);

  // Attach import/export copy button
  let clipboard = new Clipboard("#import-export-copy-button");
  clipboard.on("success", e => {
    if (!importExportCopyButton.classList.contains("copy-button-copied")) {
      importExportCopyButton.classList.add("copy-button-copied");
    }
  });
  clipboard.on("error", e => {
    importExportCopyButton.classList.add("copy-button-error");
  });

  $("#import-export-modal").on("hidden.bs.modal", () => {
    importExportCopyButton.classList.remove("copy-button-copied");
    importExportCopyButton.classList.remove("copy-button-error");
  });
}

//// DOM element creation

function createCourseEntity(course, attrs) {
  attrs = attrs || {};
  const idx = attrs.idx;
  const alreadyAdded = attrs.alreadyAdded;
  const listItem = document.createElement("li");
  listItem.classList.add("course-box");

  const listItemContent = document.createElement("div");
  listItemContent.classList.add("course-box-content");
  listItem.appendChild(listItemContent);

  //////// CREATING GROUP
  if (course.type === "group") {
    //////// VARIOUS HELPER FUNCTIONS
    function beginGroupNameChange(course) {
      if (gClickAwayFunction != null) {
        // remove any existing listener
        document.removeEventListener("mousedown", gClickAwayFunction);
      }
      gClickAwayFunction = clickHandler(course); // create reference to allow removal
      document.addEventListener("mousedown", gClickAwayFunction);
      // event signals to disallow drag-and-drop while renaming
      selectedCoursesList.dispatchEvent(new CustomEvent("coursenametyping"));
      let textBox = document.createElement("input");
      textBox.setAttribute("type", "text");
      textBox.setAttribute("value", course.title);
      textBox.classList.add("group-box-typing-box");
      groupNameContainer.appendChild(textBox);
      gFocusedGroupTextBox = textBox;
    }

    function endGroupNameChange(course) {
      if (gFocusedGroupTextBox != null) {
        // triggers losing focus, focus out event has rest of functionality
        gFocusedGroupTextBox.blur();
        gFocusedGroupTextBox = null;
        course.naming = false;
      }
    }

    // double click to start naming process
    function doubleClickHandler(course) {
      return function(event) {
        // prevent errors when double clicking already editing box
        if (course.naming != true) {
          course.naming = true;
          groupNameContainer.removeChild(groupNameContainer.lastChild);
          beginGroupNameChange(course);
          gFocusedGroupTextBoxSelection = [0, 0];
          gFocusedGroupTextBox.focus();
        }
      };
    }

    //  clicking on page, not on group name text box ends naming process
    function clickHandler(course) {
      return function(event) {
        if ($(event.target).closest(".group-box-typing-box").length === 0) {
          document.removeEventListener("mousedown", gClickAwayFunction);
          endGroupNameChange(course);
        }
      };
    }

    // hitting enter while in group name text box ends naming process
    function enterHandler(course) {
      return function(event) {
        if (event.keyCode === 13) {
          endGroupNameChange(course);
        }
      };
    }

    /////////////// Create group DOM element
    const minimizeLabel = document.createElement("label");
    minimizeLabel.classList.add("course-box-minimize-label");

    const minimizeIcon = document.createElement("i");
    minimizeIcon.classList.add("course-box-minimize-icon");
    minimizeIcon.classList.add("icon");

    const minimizeToggle = document.createElement("input");
    minimizeToggle.setAttribute("type", "checkbox");
    minimizeToggle.classList.add("course-box-button");
    minimizeToggle.classList.add("course-box-minimize-toggle");
    minimizeToggle.checked = !!course.minimized;
    minimizeToggle.addEventListener("click", () => {
      if (minimizeLabel.classList.contains("course-minimized")) {
        minimizeLabel.classList.remove("course-minimized");
        minimizeIcon.classList.remove("ion-arrow-down-b");
        minimizeIcon.classList.add("ion-arrow-right-b");
      } else {
        minimizeLabel.classList.add("course-minimized");
        minimizeIcon.classList.remove("ion-arrow-right-b");
        minimizeIcon.classList.add("ion-arrow-down-b");
      }
      toggleGroupMinimized(course);
    });
    minimizeToggle.addEventListener("click", catchEvent);
    minimizeLabel.addEventListener("click", catchEvent);
    minimizeLabel.appendChild(minimizeToggle);
    minimizeLabel.appendChild(minimizeIcon);
    listItemContent.appendChild(minimizeLabel);

    listItemContent.classList.add("group-box-content");
    const groupNameContainer = document.createElement("span");
    groupNameContainer.classList.add("course-box-text");
    groupNameContainer.classList.add("course-box-course-code");

    if (course.naming) {
      beginGroupNameChange(course);
    } else {
      let groupNameNode = document.createTextNode(course.title);
      groupNameContainer.appendChild(groupNameNode);
    }

    listItemContent.appendChild(groupNameContainer);

    groupNameContainer.addEventListener("dblclick", doubleClickHandler(course));
    groupNameContainer.addEventListener("keyup", enterHandler(course));

    groupNameContainer.addEventListener("focusout", () => {
      let textBox = groupNameContainer.lastChild;
      course.title = textBox.value;
      if (gFocusedGroupTextBox != null) {
        // record current selection
        gFocusedGroupTextBoxSelection[0] = textBox.selectionStart;
        gFocusedGroupTextBoxSelection[1] = textBox.selectionEnd;
      }
      let groupNameNode = document.createTextNode(course.title);
      groupNameContainer.removeChild(textBox);
      groupNameContainer.appendChild(groupNameNode);
      // dispatches event to reallow drag and drop
      selectedCoursesList.dispatchEvent(
        new CustomEvent("coursenametypingdone")
      );
    });

    let groupNode = document.createElement("UL");
    groupNode.classList.add("group-list");
    let sortableGroupList = Sortable.create(groupNode, {
      handle: ".course-box-text",
      ghostClass: "placeholder",
      group: "courses",
      onSort: function(evt) {
        readSelectedCoursesList();
      },
      onStart: function(evt) {
        gCurrentlySorting = true;
      },
      onEnd: function(evt) {
        gCurrentlySorting = false;
      },
      // px, distance mouse must be from empty sortable
      // to insert drag element into it
      emptyInsertThreshold: 35
    });

    if (!!course.minimized) {
      minimizeLabel.classList.add("course-minimized");
      minimizeIcon.classList.add("ion-arrow-down-b");
      groupNode.style.display = "none";
    } else {
      minimizeIcon.classList.add("ion-arrow-right-b");
      groupNode.style.display = "block";
    }

    // prevent drag and drop while typing course name
    selectedCoursesList.addEventListener("coursenametyping", () => {
      sortableGroupList.option("disabled", true);
    });
    selectedCoursesList.addEventListener("coursenametypingdone", () => {
      sortableGroupList.option("disabled", false);
    });
    listItem.appendChild(groupNode);
    listItem.classList.add("group");
  }

  ////////// CREATING COURSES
  else {
    if (course !== "placeholder") {
      listItemContent.style["background-color"] = getCourseColor(course);
      listItemContent.addEventListener("click", () => {
        setCourseDescriptionBox(course);
      });
    }

    const selectLabel = document.createElement("label");
    selectLabel.classList.add("course-box-select-label");

    const selectIcon = document.createElement("i");
    selectIcon.classList.add("course-box-select-icon");
    selectIcon.classList.add("icon");
    if (!!course.selected) {
      selectLabel.classList.add("course-selected");
      selectIcon.classList.add("ion-android-checkbox");
    } else {
      selectIcon.classList.add("ion-android-checkbox-outline-blank");
    }

    const selectToggle = document.createElement("input");
    selectToggle.setAttribute("type", "checkbox");
    selectToggle.classList.add("course-box-button");
    selectToggle.classList.add("course-box-toggle");
    selectToggle.classList.add("course-box-select-toggle");
    selectToggle.checked = !!course.selected;
    selectToggle.addEventListener("change", () => {
      if (selectLabel.classList.contains("course-selected")) {
        selectLabel.classList.remove("course-selected");
        selectIcon.classList.remove("ion-android-checkbox");
        selectIcon.classList.add("ion-android-checkbox-outline-blank");
      } else {
        selectLabel.classList.add("course-selected");
        selectIcon.classList.remove("ion-android-checkbox-outline-blank");
        selectIcon.classList.add("ion-android-checkbox");
      }

      toggleCourseSelected(course);
    });
    selectToggle.addEventListener("click", catchEvent);
    selectLabel.addEventListener("click", catchEvent);
    selectLabel.appendChild(selectToggle);
    selectLabel.appendChild(selectIcon);
    listItemContent.appendChild(selectLabel);

    const starLabel = document.createElement("label");
    starLabel.classList.add("course-box-star-label");

    const starToggle = document.createElement("input");
    starToggle.setAttribute("type", "checkbox");
    starToggle.classList.add("course-box-button");
    starToggle.classList.add("course-box-toggle");
    starToggle.classList.add("course-box-star-toggle");

    const starIcon = document.createElement("i");
    starIcon.classList.add("course-box-star-icon");
    starIcon.classList.add("icon");

    if (course !== "placeholder") {
      starLabel.classList.add("star-visible");
    }
    starToggle.checked = !!course.starred;
    if (!!course.starred) {
      starLabel.classList.add("star-checked");
      starIcon.classList.add("ion-android-star");
    } else {
      starIcon.classList.add("ion-android-star-outline");
    }
    starToggle.addEventListener("change", () => {
      if (starLabel.classList.contains("star-checked")) {
        starLabel.classList.remove("star-checked");
        starIcon.classList.remove("ion-android-star");
        starIcon.classList.add("ion-android-star-outline");
      } else {
        starLabel.classList.add("star-checked");
        starIcon.classList.remove("ion-android-star-outline");
        starIcon.classList.add("ion-android-star");
      }

      toggleCourseStarred(course);
    });
    starToggle.addEventListener("click", catchEvent);
    starLabel.addEventListener("click", catchEvent);

    starLabel.appendChild(starToggle);
    starLabel.appendChild(starIcon);
    listItemContent.appendChild(starLabel);

    const textBox = document.createElement("p");
    textBox.classList.add("course-box-text");
    listItemContent.appendChild(textBox);
    let courseCode;
    let text;
    if (course === "placeholder") {
      courseCode = "p";
      text = "placeholder";
    } else {
      courseCode = course.courseCode;
      text = courseToString(course);
    }

    const courseCodeContainer = document.createElement("span");
    const courseCodeNode = document.createTextNode(courseCode);
    courseCodeContainer.classList.add("course-box-course-code");
    courseCodeContainer.appendChild(courseCodeNode);
    const courseNameNode = document.createTextNode(text);
    textBox.appendChild(courseCodeContainer);
    textBox.appendChild(courseNameNode);

    if (!alreadyAdded) {
      const addButton = document.createElement("i");
      addButton.classList.add("course-box-button");
      addButton.classList.add("course-box-add-button");
      addButton.classList.add("icon");
      addButton.classList.add("ion-plus");

      addButton.addEventListener("click", () => {
        addCourse(course);
      });
      addButton.addEventListener("click", catchEvent);
      listItemContent.appendChild(addButton);
    }
    if (course === "placeholder") {
      listItem.classList.add("placeholder");
    }
  }

  const removeButton = document.createElement("i");
  removeButton.classList.add("course-box-button");
  removeButton.classList.add("course-box-remove-button");
  removeButton.classList.add("icon");
  removeButton.classList.add("ion-close");
  removeButton.addEventListener("click", () => {
    removeCourse(course);
  });
  removeButton.addEventListener("click", catchEvent);
  listItemContent.appendChild(removeButton);

  if (idx !== undefined) {
    listItem.setAttribute("data-course-index", idx);
  }

  return listItem;
}

function createSlotEntities(course, slot) {
  const entities = [];
  for (const slot of course.courseSchedule) {
    const startTime = timeStringToHours(slot.scheduleStartTime);
    const endTime = timeStringToHours(slot.scheduleEndTime);
    const timeSince8am = startTime - 8;
    const duration = endTime - startTime;
    const text = course.courseName;
    const verticalOffsetPercentage = ((timeSince8am + 1) / 16) * 100;
    const heightPercentage = (duration / 16) * 100;
    for (const day of slot.scheduleDays) {
      const dayIndex = "MTWRF".indexOf(day);
      if (dayIndex === -1) {
        continue;
      }

      const wrapper = redom.el(
        "div.schedule-slot-wrapper",
        {
          style: {
            gridColumnStart: Math.round(dayIndex + 2),
            gridRowStart: Math.round(timeSince8am * 12 + 2),
            gridRowEnd: "span " + Math.round(duration * 12),
            gridTemplateColumns: "repeat(" + slot.scheduleTermCount + ", 1fr)"
          },
          onclick: () => setCourseDescriptionBox(course)
        },
        getConsecutiveRanges(slot.scheduleTerms).map(([left, right]) =>
          redom.el(
            "div",
            {
              class:
                "schedule-slot" +
                (course.starred ? " schedule-slot-starred" : ""),
              style: {
                gridColumnStart: left + 1,
                gridColumnEnd: right + 1,
                backgroundColor: getCourseColor(course)
              }
            },
            [
              redom.el("p.schedule-slot-text-wrapper", [
                redom.el("p.schedule-slot-course-code", course.courseCode),
                redom.el(
                  "p.schedule-slot-course-name",
                  course.courseName +
                    " (" +
                    course.courseSeatsFilled +
                    "/" +
                    course.courseSeatsTotal +
                    ")"
                )
              ])
            ]
          )
        )
      );

      entities.push(wrapper);
    }
  }
  return entities;
}

//// DOM queries

function processSearchText() {
  const searchText = courseSearchInput.value.trim().split(/\s+/);
  let filterKeywordsValues = [];
  for (let key of Object.keys(filterKeywords)) {
    filterKeywordsValues = filterKeywordsValues.concat(filterKeywords[key]);
  }
  let filtersText = [];
  let queryText = [];

  for (let text of searchText) {
    text = text.toLowerCase();
    if (
      _.some(filter => {
        return text.includes(filter);
      }, filterKeywordsValues)
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

function getSearchQuery(searchTextArray) {
  return searchTextArray.map(subquery => {
    return new RegExp(quoteRegexp(subquery), "i");
  });
}

function getSearchTextFilters(filtersTextArray) {
  let filter = {};
  for (let text of filtersTextArray) {
    const keyword = text.split(":")[0] + ":";
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

//// DOM updates
///// DOM updates due to global state change

function updateTabToggle() {
  setEntityVisibility(scheduleColumn, gScheduleTabSelected);
  setButtonSelected(scheduleToggle, gScheduleTabSelected);

  setEntityVisibility(courseSearchColumn, !gScheduleTabSelected);
  setButtonSelected(courseSearchToggle, !gScheduleTabSelected);
}

function updateShowClosedCoursesCheckbox() {
  closedCoursesToggle.checked = gShowClosedCourses;
}

function updateShowConflictingCoursesCheckbox() {
  hideAllConflictingCoursesToggle.checked = gHideAllConflictingCourses;
  hideStarredConflictingCoursesToggle.checked = gHideStarredConflictingCourses;
}

function updateConflictCoursesRadio() {
  switch (gGreyConflictCourses) {
    case greyConflictCoursesOptions[0]:
      conflictCoursesRadios[0].checked = true;
      break;

    case greyConflictCoursesOptions[1]:
      conflictCoursesRadios[1].checked = true;
      break;

    case greyConflictCoursesOptions[2]:
      conflictCoursesRadios[2].checked = true;
      break;

    default:
      conflictCoursesRadios[0].checked = true;
  }
}

function updateCourseSearchResults() {
  if (gApiData === null) {
    gFilteredCourseKeys = [];
  } else {
    const { query, filters } = processSearchText();

    gFilteredCourseKeys =
      gApiData === null
        ? []
        : Object.keys(gApiData.data.courses).filter(key => {
            const course = gApiData.data.courses[key];
            return (
              courseMatchesSearchQuery(course, query) &&
              coursePassesTextFilters(course, filters) &&
              (gShowClosedCourses || !isCourseClosed(course)) &&
              (!gHideAllConflictingCourses ||
                !courseConflictWithSchedule(course, false)) &&
              (!gHideStarredConflictingCourses ||
                !courseConflictWithSchedule(course, true))
            );
          });
  }

  rerenderCourseSearchResults();
}

function rerenderCourseSearchResults() {
  if (gApiData === null) {
    courseSearchResultsEnd.textContent = "Fetching courses from Portal...";
    return;
  }

  // Remove courses that should no longer be shown (or all courses, if
  // updating non-incrementally).
  while (courseSearchResultsList.childElementCount > 0) {
    // Make sure to remove from the end.
    courseSearchResultsList.removeChild(courseSearchResultsList.lastChild);
  }

  let numToShow =
    (document.documentElement.clientHeight / gCourseEntityHeight) * 3;
  const startIndex = Math.floor(
    (courseSearchResults.scrollTop - document.documentElement.clientHeight) /
      gCourseEntityHeight
  );

  let numAlreadyShown = courseSearchResultsList.childElementCount;
  let allCoursesDisplayed = true;
  // 0 in case of non-incremental update
  let numAdded = numAlreadyShown;

  for (
    let index = Math.max(startIndex, 0);
    index < Math.min(startIndex + numToShow, gFilteredCourseKeys.length);
    ++index
  ) {
    const course = gApiData.data.courses[gFilteredCourseKeys[index]];
    const alreadyAdded = courseAlreadyAdded(course);
    const entity = createCourseEntity(course, { alreadyAdded });
    entity.style.top = "" + gCourseEntityHeight * index + "px";
    courseSearchResultsList.appendChild(entity);
  }

  courseSearchResultsPlaceholder.style.height =
    gCourseEntityHeight * gFilteredCourseKeys.length + "px";

  courseSearchResultsEnd.textContent =
    gFilteredCourseKeys.length != 0 ? "End of results" : "No results";
}

/*
Updates the DOM Object selectedCoursesList based on what is in
gNestedSelectedCoursesAndGroups
*/
function updateSelectedCoursesList() {
  if (gCurrentlySorting) {
    // Defer to after the user has finished sorting, otherwise we mess
    // up the drag and drop.
    setTimeout(updateSelectedCoursesList, 100);
    return;
  }
  while (selectedCoursesList.hasChildNodes()) {
    selectedCoursesList.removeChild(selectedCoursesList.lastChild);
  }
  updateSelectedCoursesListHelper(
    gNestedSelectedCoursesAndGroups,
    selectedCoursesList,
    0
  );
  if (gFocusedGroupTextBox != null) {
    // refocus on a group text box that was being typed in before update
    gFocusedGroupTextBox.focus();
    gFocusedGroupTextBox.setSelectionRange(
      gFocusedGroupTextBoxSelection[0],
      gFocusedGroupTextBoxSelection[1]
    );
  }
}

function updateSelectedCoursesListHelper(inputList, outputList, index) {
  for (let idx = 0; idx < inputList.length; ++idx) {
    const course = inputList[idx];
    if (Array.isArray(course)) {
      // means course is actually a group and should recurse accordingly
      let courseBox = createCourseEntity(course[0], {
        idx: index,
        alreadyAdded: true
      });
      index++;
      let groupList = courseBox.lastChild;
      index = updateSelectedCoursesListHelper(course[1], groupList, index);
      outputList.appendChild(courseBox);
    } else {
      outputList.appendChild(
        createCourseEntity(course, { idx: index, alreadyAdded: true })
      );
      index++;
    }
  }
  return index;
}

function updateSchedule() {
  const schedule = computeSchedule(gSelectedCourses);
  while (scheduleTable.getElementsByClassName("schedule-slot").length > 0) {
    const element = scheduleTable.getElementsByClassName(
      "schedule-slot-wrapper"
    )[0];
    element.parentNode.removeChild(element);
  }
  for (let course of schedule) {
    const entities = createSlotEntities(course);
    _.forEach(e => scheduleTable.appendChild(e), entities);
  }
  creditCountText.textContent = computeCreditCountDescription(schedule);
}

///// DOM updates due to display changes

function updateCourseDescriptionBoxHeight() {
  if (
    courseDescriptionBoxOuter.classList.contains(
      "course-description-box-visible"
    )
  ) {
    courseDescriptionBoxOuter.style.height =
      "" + courseDescriptionBox.scrollHeight + "px";
  } else {
    courseDescriptionBoxOuter.style.height = "0px";
  }
}

///// DOM updates miscellaneous

function showImportExportModal() {
  importExportTextArea.value = JSON.stringify(gSelectedCourses, 2);
  $("#import-export-modal").modal("show");
}

function showSettingsModal() {
  $("#settings-modal").modal("show");
}

function setCourseDescriptionBox(course) {
  while (courseDescriptionBox.hasChildNodes()) {
    courseDescriptionBox.removeChild(courseDescriptionBox.lastChild);
  }
  const description = generateCourseDescription(course);
  for (let idx = 0; idx < description.length; ++idx) {
    const line = description[idx];
    if (idx !== 0) {
      courseDescriptionBox.appendChild(document.createElement("hr"));
    }
    const paragraph = document.createElement("p");
    const text = document.createTextNode(line);
    paragraph.appendChild(text);
    courseDescriptionBox.appendChild(paragraph);
  }
  minimizeArrowPointUp();
  courseDescriptionVisible();
}

function minimizeCourseDescription() {
  if (
    courseDescriptionBoxOuter.classList.contains(
      "course-description-box-visible"
    )
  ) {
    courseDescriptionInvisible();
    minimizeArrowPointDown();
  } else {
    courseDescriptionVisible();
    minimizeArrowPointUp();
  }
}

function courseDescriptionInvisible() {
  courseDescriptionBoxOuter.classList.remove("course-description-box-visible");
  updateCourseDescriptionBoxHeight();
}

function courseDescriptionVisible() {
  courseDescriptionBoxOuter.classList.add("course-description-box-visible");
  courseDescriptionMinimizeOuter.style.height = `${courseDescriptionMinimizeOuter.scrollHeight}px`;
  updateCourseDescriptionBoxHeight();
}

function minimizeArrowPointUp() {
  minimizeIcon.classList.remove("ion-arrow-down-b");
  minimizeIcon.classList.add("ion-arrow-up-b");
}

function minimizeArrowPointDown() {
  minimizeIcon.classList.remove("ion-arrow-up-b");
  minimizeIcon.classList.add("ion-arrow-down-b");
}

//// Group functions

function createGroup() {
  let g = {
    title: "Unnamed Group",
    type: "group",
    groupID: gGroupCounter,
    minimized: false,
    naming: true
  };
  gGroupCounter += 1;
  gNestedSelectedCoursesAndGroups.push([g, []]);

  // stop typing on currently open text box
  // https://stackoverflow.com/a/51457710
  if (gFocusedGroupTextBox != null) {
    let e = new KeyBoardEvent("keydown", {
      code: "Enter",
      key: "Enter",
      charKode: 13,
      keyCode: 13,
      view: window
    });
    gFocusedGroupTextBox.dispatchEvent(e);
  }
  gFocusedGroupTextBoxSelection = [0, 13]; // enough to highlight
  handleSelectedCoursesUpdate();
}

/// Global state handling
//// Combined update functions

function handleCourseSearchInputUpdate() {
  updateCourseSearchResults();
}

function handleSelectedCoursesUpdate() {
  // Update the derivative variable from main (gNestedSelectedCoursesAndGroups)
  gSelectedCourses = gNestedSelectedCoursesAndGroups
    .flatten(Infinity)
    .filter(course => course.type !== "group");

  // Reindex the course boxes to match any new ordering
  indexSelectedCourses(selectedCoursesList.children, 0);

  function indexSelectedCourses(lst, index) {
    for (let entity of lst) {
      entity.setAttribute("data-course-index", index);
      index += 1;
      if (entity.classList.contains("group")) {
        index = indexSelectedCourses(entity.lastChild.children, index);
      }
    }
    return index;
  }

  // We need to add/remove the "+" buttons.
  rerenderCourseSearchResults();

  // Obviously the selected courses list needs to be rebuilt.
  updateSelectedCoursesList();

  // New courses might be placed on the schedule.
  updateSchedule();

  // Also save changes.
  writeStateToLocalStorage();
}

function handleGlobalStateUpdate() {
  // Update UI elements.
  updateTabToggle();
  updateShowClosedCoursesCheckbox();
  updateShowConflictingCoursesCheckbox();
  updateConflictCoursesRadio();

  // Update course displays.
  updateCourseDisplays();

  // Canonicalize the state of local storage.
  writeStateToLocalStorage();
}

//// Global state mutation

function addCourse(course) {
  if (courseAlreadyAdded(course)) {
    return;
  }
  course = deepCopy(course);
  course.selected = true;
  course.starred = false;
  gNestedSelectedCoursesAndGroups.push(course);
  handleSelectedCoursesUpdate();
}

function removeCourse(course) {
  removeCourseHelper(course, gNestedSelectedCoursesAndGroups);

  function removeCourseHelper(course, list) {
    /*
    finds index of matching course or group; if none found, return -1
    */
    function findIndex(list, course) {
      for (let idx = 0; idx < list.length; idx++) {
        if (course.courseCode === list[idx].courseCode) {
          return idx;
        } else if (course.groupID === list[idx].groupID) {
          return idx;
        }
      }
      return -1;
    }

    let idx;
    if (course.type === "group") {
      idx = list.findIndex(g => Array.isArray(g) && g[0] === course);
    } else {
      idx = list.indexOf(course);
    }
    if (idx !== -1) {
      if (course.type === "group") {
        list.splice(idx, 1, ...list[idx][1]);
      } else {
        list.splice(idx, 1);
      }
      handleSelectedCoursesUpdate();
      return;
    } else {
      let groups = list.filter(Array.isArray);
      if (groups.length > 0) {
        for (let group of groups) {
          let groupList = group[1];
          removeCourseHelper(course, groupList);
        }
      }
    }
  }
}

/*
update the array gNestedSelectedCoursesAndGroups based on what is in the
DOM object selectedCoursesList
*/
function readSelectedCoursesList() {
  gNestedSelectedCoursesAndGroups = readSelectedCoursesListHelper(
    selectedCoursesList.children
  );
  handleSelectedCoursesUpdate();

  function readSelectedCoursesListHelper(lst) {
    const newSelectedCourses = [];
    for (let entity of lst) {
      const idx = parseInt(entity.getAttribute("data-course-index"), 10);
      const course = gNestedSelectedCoursesAndGroups.flatten(Infinity)[idx];
      if (entity.classList.contains("group")) {
        let temp = [];
        if (entity.lastChild.hasChildNodes) {
          temp = readSelectedCoursesListHelper(entity.lastChild.children);
        }
        newSelectedCourses.push([course, temp]);
      } else {
        newSelectedCourses.push(course);
      }
    }
    return newSelectedCourses;
  }
}

function saveImportExportModalChanges() {
  let obj;
  try {
    obj = JSON.parse(importExportTextArea.value);
    if (!Array.isArray(obj)) {
      throw Error();
    }
  } catch (err) {
    alert("Malformed JSON. Refusing to save.");
    return;
  }
  gNestedSelectedCoursesAndGroups = upgradeSelectedCourses(obj);
  handleSelectedCoursesUpdate();
  $("#import-export-modal").modal("hide");
}

function toggleClosedCourses() {
  gShowClosedCourses = !gShowClosedCourses;
  updateCourseSearchResults();
  writeStateToLocalStorage();
}

function toggleAllConflictingCourses() {
  gHideAllConflictingCourses = !gHideAllConflictingCourses;
  updateCourseSearchResults();
}

function toggleStarredConflictingCourses() {
  gHideStarredConflictingCourses = !gHideStarredConflictingCourses;
  updateCourseSearchResults();
}

function toggleConflictCourses() {
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function toggleGroupMinimized(group) {
  group.minimized = !group.minimized;
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function toggleCourseSelected(course) {
  course.selected = !course.selected;
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function toggleCourseStarred(course) {
  course.starred = !course.starred;
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function updateCourseDisplays() {
  updateCourseSearchResults();
  updateSelectedCoursesList();
  updateSchedule();
}

function displayCourseSearchColumn() {
  this.blur();
  gScheduleTabSelected = false;
  updateTabToggle();
  writeStateToLocalStorage();
}

function displayScheduleColumn() {
  this.blur();
  gScheduleTabSelected = true;
  updateTabToggle();
  writeStateToLocalStorage();
}

//// Course retrieval

/**
 * Given an arbitrary data value and an arbitrary diff (see the
 * documentation for the Hyperschedule backend for information about
 * the format of diffs), apply the diff and return a new data object.
 * The original data object may have been mutated.
 */
function applyDiff(data, diff) {
  if (!_.isObject(data) || !_.isObject(diff)) {
    return diff;
  }

  _.forEach.convert({ cap: false })((val, key) => {
    if (val === "$delete") {
      _.unset(data, key);
    } else if (!_.has(data, key)) {
      _.set(data, key, val);
    } else {
      _.set(data, key, applyDiff(_.get(data, key), val));
    }
  }, diff);

  return data;
}

async function retrieveCourseData() {
  let apiEndpoint = "/api/v3/courses?school=hmc";
  // Hotfix for error in production that prevents course data from
  // being updated correctly. Kills performance but should ensure data
  // correctness.
  // if (gApiData !== null) {
  //   apiEndpoint += `&since=${gApiData.until}`;
  // }
  const apiResponse = await retrieveAPI(apiEndpoint);
  if (apiResponse.error) {
    throw Error(`API error: ${apiResponse.error}`);
  }
  // Atomic update.
  let apiData = gApiData;
  let wasUpdated = false;
  if (apiResponse.full || true) {
    // hotfix
    apiData = _.pick(["data", "until"], apiResponse);
    wasUpdated = true;
  } else {
    const diff = apiResponse.data;
    if (!_.isEmpty(diff)) {
      wasUpdated = true;
      apiData.data = applyDiff(apiData.data, diff);
    }
    apiData.until = apiResponse.until;
  }
  for (const selectedCourse of gSelectedCourses) {
    if (_.has(selectedCourse.courseCode, apiData.data.courses)) {
      Object.assign(
        selectedCourse,
        apiData.data.courses[selectedCourse.courseCode]
      );
    }
  }

  if (wasUpdated) {
    const terms = _.values(apiData.data.terms);
    terms.sort((t1, t2) => compareArrays(t1.termSortKey, t2.termSortKey));
    apiData.data.terms = {};
    _.forEach(t => {
      apiData.data.terms[t.termCode] = t;
    }, terms);

    const courses = _.values(apiData.data.courses);
    courses.sort((t1, t2) => compareArrays(t1.courseSortKey, t2.courseSortKey));
    apiData.data.courses = {};
    _.forEach(c => {
      apiData.data.courses[c.courseCode] = c;
    }, courses);
  }

  gApiData = apiData;

  if (wasUpdated) {
    // necessary for Firefox to make refresh naming work
    if (gFocusedGroupTextBox != null) {
      gFocusedGroupTextBox.blur();
    }
    updateCourseSearchResults();
    updateSelectedCoursesList();
    updateSchedule();
  }

  // API data was updated regardless.
  writeStateToLocalStorage();
}

async function retrieveCourseDataUntilSuccessful() {
  const pollInterval = 5 * 1000;
  await runWithExponentialBackoff(
    async () => {
      await retrieveCourseData();
      console.log("Successfully fetched course data.");
      console.log(`Polling again in ${pollInterval}ms.`);
      setTimeout(retrieveCourseDataUntilSuccessful, pollInterval);
    },
    500,
    1.5,
    "fetch course data"
  );
}

//// Local storage

function writeStateToLocalStorage() {
  localStorage.setItem("apiData", JSON.stringify(gApiData));
  localStorage.setItem("selectedCourses", JSON.stringify(gSelectedCourses));
  localStorage.setItem(
    "nestedSelectedCoursesAndGroups",
    JSON.stringify(gNestedSelectedCoursesAndGroups)
  );
  localStorage.setItem("scheduleTabSelected", gScheduleTabSelected);
  localStorage.setItem("showClosedCourses", gShowClosedCourses);
  localStorage.setItem("hideAllConflictingCourses", gHideAllConflictingCourses);
  localStorage.setItem(
    "hideStarredConflictingCourses",
    gHideStarredConflictingCourses
  );
  localStorage.setItem(
    "greyConflictCourses",
    JSON.stringify(gGreyConflictCourses)
  );
}

function oldCourseToString(course) {
  return (
    course.department +
    " " +
    course.courseNumber.toString().padStart(3, "0") +
    course.courseCodeSuffix +
    " " +
    course.school +
    "-" +
    course.section.toString().padStart(2, "0")
  );
}

function upgradeSelectedCourses(selectedCourses) {
  return _.map(course => {
    if (!_.has("quarterCredits", course)) {
      return course;
    }

    // Course object is in old format returned by API v3. Upgrade to
    // API v4 format.
    return {
      courseCode: oldCourseToString(course),
      courseCredits: _.toString(course.quarterCredits / 4),
      courseDescription: course.courseDescription,
      courseEnrollmentStatus: course.courseStatus,
      courseInstructors: course.faculty,
      courseMutualExclusionKey: [
        course.department,
        course.courseNumber,
        course.courseCodeSuffix,
        course.school
      ],
      courseName: course.courseName,
      courseSchedule: _.map(slot => {
        return {
          scheduleDays: slot.days,
          scheduleEndDate: course.endDate,
          scheduleEndTime: slot.endTime,
          scheduleLocation: slot.location,
          scheduleStartDate: course.startDate,
          scheduleStartTime: slot.startTime,
          scheduleTermCount:
            course.firstHalfSemester && course.secondHalfSemester ? 1 : 2,
          scheduleTerms: !course.firstHalfSemester ? [1] : [0]
        };
      }, course.schedule),
      courseSeatsFilled: course.openSeats,
      courseSeatsTotal: course.totalSeats,
      courseSortKey: [
        course.department,
        course.courseNumber,
        course.courseCodeSuffix,
        course.school,
        course.section
      ],
      courseTerm: "Unknown",
      courseWaitlistLength: null,
      selected: course.selected,
      starred: course.starred
    };
  }, selectedCourses);
}

function readStateFromLocalStorage() {
  gApiData = readFromLocalStorage("apiData", _.isObject, null);
  gSelectedCourses = upgradeSelectedCourses(
    readFromLocalStorage("selectedCourses", _.isArray, [])
  );
  gNestedSelectedCoursesAndGroups = upgradeSelectedCourses(
    readFromLocalStorage("nestedSelectedCoursesAndGroups", _.isArray, [])
  );
  gScheduleTabSelected = readFromLocalStorage(
    "scheduleTabSelected",
    _.isBoolean,
    false
  );
  gShowClosedCourses = readFromLocalStorage(
    "showClosedCourses",
    _.isBoolean,
    true
  );
  gHideAllConflictingCourses = readFromLocalStorage(
    "hideAllConflictingCourses",
    _.isBoolean,
    false
  );
  gHideStarredConflictingCourses = readFromLocalStorage(
    "hideStarredConflictingCourses",
    _.isBoolean,
    false
  );
  gGreyConflictCourses = readFromLocalStorage(
    "greyConflictCourses",
    validateGGreyConflictCourses,
    greyConflictCoursesOptions[0]
  );
}

function validateGGreyConflictCourses(value) {
  if (!_.isString(value)) {
    return false;
  }
  return greyConflictCoursesOptions.includes(value);
}

/// PDF download

function downloadPDF(starredOnly) {
  // initialize PDF object
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
    orientation: "l"
  });

  // calculate some basic dimensions
  const tableWidth = (11 - 1) * 72;
  const tableHeight = (8.5 - 1) * 72;

  const bodyWidth = tableWidth - 0.75 * 72;
  const bodyHeight = tableHeight - 0.25 * 72;

  const columnWidth = bodyWidth / 7;
  const rowHeight = bodyHeight / 16;

  // set global styles
  pdf.setFont("Helvetica");
  pdf.setFontSize(6);
  pdf.setLineWidth(0.5);

  pdf.setDrawColor(192); // light gray
  pdf.setFillColor(255); // white

  // white background
  pdf.rect(0, 0, 11 * 72, 8.5 * 72, "F");

  // grid columns (alternating fill)
  for (let i = 0; i < 7; ++i) {
    const x = i * columnWidth + 1.25 * 72;

    pdf.setFillColor(i & 1 ? 255 : 230);
    pdf.rect(x, 0.5 * 72, columnWidth, tableHeight, "F");

    // column header
    pdf.setFontStyle("bold");
    pdf.text(
      x + columnWidth / 2,
      0.5 * 72 + (0.25 * 72) / 2 + pdf.getLineHeight() / 2,
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ][i],
      "center"
    );
  }

  // grid rows
  pdf.setFontStyle("normal");
  for (let i = 0; i < 16; ++i) {
    const y = i * rowHeight + 0.75 * 72;
    pdf.line(0.5 * 72, y, 0.5 * 72 + tableWidth, y);

    pdf.text(
      1.25 * 72 - 6,
      y + pdf.getLineHeight() + 3,
      [
        "8:00 am",
        "9:00 am",
        "10:00 am",
        "11:00 am",
        "12:00 pm",
        "1:00 pm",
        "2:00 pm",
        "3:00 pm",
        "4:00 pm",
        "5:00 pm",
        "6:00 pm",
        "7:00 pm",
        "8:00 pm",
        "9:00 pm",
        "10:00 pm",
        "11:00 pm"
      ][i],
      "right"
    );
  }

  // header underline
  pdf.line(1.25 * 72, 0.5 * 72, 1.25 * 72, 0.5 * 72 + tableHeight);

  let pdfCourses = [];
  if (!starredOnly) {
    pdfCourses = gSelectedCourses;
  } else {
    for (const course of gSelectedCourses) {
      if (course.starred) {
        pdfCourses.push(course);
      }
    }
  }

  // course entities
  for (const course of computeSchedule(pdfCourses)) {
    for (const slot of course.courseSchedule) {
      const [startHours, startMinutes] = timeStringToHoursAndMinutes(
        slot.scheduleStartTime
      );
      const [endHours, endMinutes] = timeStringToHoursAndMinutes(
        slot.scheduleEndTime
      );

      for (const day of slot.scheduleDays) {
        for (const [left, right] of getConsecutiveRanges(slot.scheduleTerms)) {
          const x =
            weekdayCharToInteger(day) * columnWidth +
            1.25 * 72 +
            columnWidth * (left / slot.scheduleTermCount);

          const width =
            (columnWidth * (right - left + 1)) / slot.scheduleTermCount;

          const yStart =
            (startHours - 8 + startMinutes / 60) * rowHeight + 0.75 * 72;

          const yEnd = (endHours - 8 + endMinutes / 60) * rowHeight + 0.75 * 72;

          pdf.setFillColor(...getCourseColor(course, "rgbArray"));

          pdf.rect(x, yStart, width, yEnd - yStart, "F");

          const courseCodeLines = pdf.splitTextToSize(
            course.courseCode,
            width - 12
          );
          const courseNameLines = pdf.splitTextToSize(
            course.courseName,
            width - 12
          );
          const courseLocationLines = pdf.splitTextToSize(
            slot.scheduleLocation,
            width - 12
          );
          const courseInstructorsLines = pdf.splitTextToSize(
            courseToInstructorLastnames(course),
            width - 12
          );

          // Attributes to be shown are calculated based on space available
          // order of preference: Code, location, name, professor
          // order of display: code, name, professor, location

          const entriesByPreference = [
            "code",
            "location",
            "name",
            "instructor"
          ];
          const entriesByOrder = ["code", "name", "instructor", "location"];

          let entryNameToText = {
            code: courseCodeLines,
            location: courseLocationLines,
            name: courseNameLines,
            instructor: courseInstructorsLines
          };

          // Limits size of text to ensure some white space at top and bottom
          const maxTextLength = yEnd - yStart - 2 * pdf.getLineHeight();
          let numEntries = 0;
          let totalLength = 0;
          while (
            totalLength * pdf.getLineHeight() < maxTextLength &&
            numEntries < entriesByPreference.length
          ) {
            totalLength +=
              entryNameToText[entriesByPreference[numEntries]].length;
            numEntries += 1;
          }

          const xText = x + width / 2;
          // Find height to start the text so that it will be centered in the block
          let yText =
            (yStart + yEnd) / 2 -
            (totalLength * pdf.getLineHeight()) / 2 +
            pdf.getLineHeight();

          pdf.setFontStyle("bold");
          pdf.text(xText, yText, courseCodeLines, "center");
          yText += courseCodeLines.length * pdf.getLineHeight();
          pdf.setFontStyle("normal");

          for (let entry of entriesByOrder) {
            if (entriesByPreference.slice(1, numEntries).includes(entry)) {
              pdf.text(xText, yText, entryNameToText[entry], "center");
              yText += entryNameToText[entry].length * pdf.getLineHeight();
            }
          }
        }
      }
    }
  }

  // grid outline
  pdf.rect(0.5 * 72, 0.5 * 72, tableWidth, tableHeight, "S");

  // save PDF
  pdf.save("hyperschedule.pdf");
}

/// iCal download

function convertDayToICal(weekday) {
  switch (weekday) {
    case "U":
      return "SU";
    case "M":
      return "MO";
    case "T":
      return "TU";
    case "W":
      return "WE";
    case "R":
      return "TH";
    case "F":
      return "FR";
    case "S":
      return "SA";
  }
  throw Error("Invalid weekday: " + weekday);
}

// See https://github.com/nwcell/ics.js/issues/26.
function uglyHack(input) {
  return input.replace(/\n/g, "\\n").replace(/,/g, "\\,");
}

function downloadICalFile() {
  if (gSelectedCourses.length === 0) {
    alert("You have not added any courses to export.");
    return;
  }
  const cal = ics();
  let anyStarred = false;
  let anySelected = false;
  for (let course of gSelectedCourses) {
    if (course.selected && course.starred) {
      anyStarred = true;
    }
    if (course.selected) {
      anySelected = true;
    }
  }
  for (let course of gSelectedCourses) {
    if ((!anySelected || course.selected) && (!anyStarred || course.starred)) {
      const subject = course.courseName;
      const description = uglyHack(
        course.courseCode +
          " " +
          course.courseName +
          "\n" +
          formatList(course.courseInstructors)
      );
      for (let slot of course.courseSchedule) {
        const listedStartDay = parseDate(slot.scheduleStartDate);
        const listedStartWeekday = listedStartDay.getDay();
        const listedEndDay = parseDate(slot.scheduleEndDate);
        // The range is inclusive, but ics.js interprets it exclusively.
        listedEndDay.setDate(listedEndDay.getDate() + 1);
        const location = uglyHack(slot.scheduleLocation);
        // Determine the first day of class. We want to pick the
        // weekday that occurs the soonest after (possibly on the same
        // day as) the listed start date.
        let startWeekday = null;
        let weekdayDifference = 7;
        for (let weekday of slot.scheduleDays) {
          const possibleStartWeekday = weekdayCharToInteger(weekday);
          const possibleWeekdayDifference = mod(
            possibleStartWeekday - listedStartWeekday,
            7
          );
          if (possibleWeekdayDifference < weekdayDifference) {
            startWeekday = possibleStartWeekday;
            weekdayDifference = possibleWeekdayDifference;
          }
        }
        // See https://stackoverflow.com/a/563442/3538165.
        const start = new Date(listedStartDay.valueOf());
        start.setDate(start.getDate() + weekdayDifference);
        const [startHours, startMinutes] = timeStringToHoursAndMinutes(
          slot.scheduleStartTime
        );
        start.setHours(startHours);
        start.setMinutes(startMinutes);
        const end = new Date(start.valueOf());
        const [endHours, endMinutes] = timeStringToHoursAndMinutes(
          slot.scheduleEndTime
        );
        end.setHours(endHours);
        end.setMinutes(endMinutes);
        const freq = "WEEKLY";
        const until = listedEndDay;
        const interval = 1;
        const byday = slot.scheduleDays.split("").map(convertDayToICal);
        const rrule = {
          freq,
          until,
          interval,
          byday
        };
        cal.addEvent(subject, description, location, start, end, rrule);
      }
    }
  }
  cal.download("hyperschedule-export");
}

/// Startup actions

attachListeners();
readStateFromLocalStorage();
handleGlobalStateUpdate();
retrieveCourseDataUntilSuccessful();

/// Closing remarks

// Local Variables:
// outline-regexp: "///+"
// End:
