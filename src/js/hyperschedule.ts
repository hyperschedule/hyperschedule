// To see the outline of this file from Emacs, run M-x
// outline-minor-mode and then press C-c @ C-t. To also show the
// top-level functions and variable declarations in each section, run
// M-x occur with the following query: ^\(///+\|const\|\(async \)?function\|let\)

/// Globals
//// Modules

import "../css/normalize.css";
import "../css/main.css";

// untyped, so using require here
const ics = require("./vendor/ics-0.2.0.min.js");
const sortable = require("html5sortable/dist/html5sortable.cjs");

import * as Redom from "redom";
import Clipboard from "clipboard";
import { jsPDF } from "jspdf";
import * as math from "mathjs";
import $ from "jquery";
import "bootstrap";
import randomColor from "randomcolor";

import * as Course from "./course";
import * as SortKey from "./sort-key";
import * as Schedule from "./schedule";
import * as Util from "./util";
import * as TimeString from "./time-string";
import * as Pdf from "./pdf";

import * as _ from "lodash/fp";

interface ApiData {
  data: {
    terms: Record<string, Term>;
    courses: Record<string, Course.CourseV3>;
  };
  until: number;
}

type Weekday = "U" | "M" | "T" | "W" | "R" | "F" | "S";

interface Term {
  termCode: string;
  termSortKey: SortKey.SortKey;
  termName: string;
}

//// Data constants

const millisecondsPerHour = 3600 * 1000;
const pacificTimeZoneValues = [-8.0, -7.0];
const pacificTimeZoneId = 5;

const apiURL = process.env.API_URL || "https://hyperschedule.herokuapp.com";

const greyConflictCoursesOptions = ["none", "starred", "all"];

const filterKeywords: Record<string, string[]> = {
  "dept:": ["dept:", "department:"],
  "college:": ["college", "col:", "school:", "sch:"],
  "days:": ["days:", "day:"]
};

const filterInequalities = ["<=", ">=", "<", ">", "="];
const pacificScheduleDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const pacificScheduleTimes = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00"
];

//// DOM elements

const motd = document.getElementById("motd")!;

const courseSearchToggle = document.getElementById("course-search-toggle")!;
const scheduleToggle = document.getElementById("schedule-toggle")!;

const closedCoursesToggle = <HTMLInputElement>(
  document.getElementById("closed-courses-toggle")!
);
const hideAllConflictingCoursesToggle = <HTMLInputElement>(
  document.getElementById("all-conflicting-courses-toggle")!
);
const hideStarredConflictingCoursesToggle = <HTMLInputElement>(
  document.getElementById("star-conflicting-courses-toggle")!
);

const courseSearchScheduleColumn = document.getElementById(
  "course-search-schedule-column"
)!;
const courseSearchColumn = document.getElementById("course-search-column")!;
const scheduleColumn = document.getElementById("schedule-column")!;

const courseSearchInput = <HTMLInputElement>(
  document.getElementById("course-search-course-name-input")!
);
const courseSearchResults = document.getElementById("course-search-results")!;
const courseSearchResultsList = document.getElementById(
  "course-search-results-list"
)!;
const courseSearchResultsPlaceholder = document.getElementById(
  "course-search-results-placeholder"
)!;
const courseSearchResultsEnd = document.getElementById(
  "course-search-results-end"
)!;

const selectedCoursesColumn = document.getElementById(
  "selected-courses-column"
)!;
const importExportDataButton = document.getElementById(
  "import-export-data-button"
)!;
const printDropdown = document.getElementById("print-dropdown")!;
const printAllButton = document.getElementById("print-button-all")!;
const printStarredButton = document.getElementById("print-button-starred")!;
const settingsButton = document.getElementById("settings-button")!;

const conflictCoursesRadios = <NodeListOf<HTMLInputElement>>(
  document.getElementsByName("conflict-courses")
);
const timeZoneDropdown = <HTMLSelectElement>(
  document.getElementById("time-zone-dropdown")!
);

const courseDescriptionMinimizeOuter = document.getElementById(
  "minimize-outer"
)!;
const courseDescriptionMinimize = document.getElementById(
  "course-description-minimize"
)!;
const minimizeIcon = document.getElementById("minimize-icon")!;
const courseDescriptionBox = document.getElementById("course-description-box")!;
const courseDescriptionBoxOuter = document.getElementById(
  "course-description-box-outer"
)!;

const selectedCoursesList = document.getElementById("selected-courses-list")!;

const scheduleTable = document.getElementById("schedule-table")!;
const scheduleTableBody = document.getElementById("schedule-table-body")!;
const scheduleTableDays = document.getElementsByClassName("schedule-day");
const scheduleTableHours = document.getElementsByClassName("schedule-hour");
const creditCountText = document.getElementById("credit-count")!;

const importExportTextArea = <HTMLInputElement>(
  document.getElementById("import-export-text-area")!
);
const importExportICalButton = document.getElementById(
  "import-export-ical-button"
)!;
const importExportSaveChangesButton = document.getElementById(
  "import-export-save-changes-button"
)!;
const importExportCopyButton = document.getElementById(
  "import-export-copy-button"
)!;

//// Global state

// Persistent data.
let gApiData: ApiData | null = null;
let gSelectedCourses: Course.CourseV3[] = [];
let gScheduleTabSelected = false;
let gShowClosedCourses = true;
let gHideAllConflictingCourses = false;
let gHideStarredConflictingCourses = false;
let gGreyConflictCourses = greyConflictCoursesOptions[0];
let gTimeZoneValues = pacificTimeZoneValues; // time zone values of selected time zone
let gTimeZoneId = pacificTimeZoneId; // time zone id of selected time zone
let gTimeZoneSavings = 0; // 0 if savings time, 1 if daylight time (for selected time zone)
let gPacificTimeSavings = 0; // 0 if PST, 1 if PDT

// Transient data.
let gCurrentlySorting = false;
let gCourseEntityHeight = 0;
let gFilteredCourseKeys: string[] = [];
let gCourseSelected: Course.CourseV3 | null = null;

/// Utility functions
//// JavaScript utility functions

// Convert YYYY-MM-DD to Date. Taken from
// https://stackoverflow.com/a/7151607/3538165.
function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

// https://stackoverflow.com/a/2593661
function quoteRegexp(str: string) {
  return (str + "").replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

// https://stackoverflow.com/a/29018745/3538165
function binarySearch<T>(ar: T[], el: T, compare_fn: (a: T, b: T) => number) {
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

function deepCopy(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

function weekdayCharToInteger(weekday: string) {
  const index = "UMTWRFS".indexOf(weekday);
  if (index < 0) {
    throw Error("Invalid weekday: " + weekday);
  }
  return index;
}

function readFromLocalStorage<T>(key: string, pred: (a: T) => boolean, def: T) {
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

//// Time utility functions

function checkPST() {
  let today = new Date();
  let start = nthSundayOfMonth(
    10,
    1,
    2,
    0,
    pacificTimeZoneValues[gPacificTimeSavings]
  );
  let end = nthSundayOfMonth(
    2,
    2,
    2,
    0,
    pacificTimeZoneValues[gPacificTimeSavings]
  );
  return today > start || today < end ? 0 : 1;
}

function checkTimeZoneSavings() {
  let selectedTimeZoneClassList =
    timeZoneDropdown.options[timeZoneDropdown.selectedIndex].classList;

  if (selectedTimeZoneClassList.length == 0) {
    return 0;
  }

  let savingTimeZone = selectedTimeZoneClassList[0].substring(
    0,
    selectedTimeZoneClassList[0].indexOf("-")
  );
  let start, end;
  let timeZoneValue = gTimeZoneValues[0];

  switch (savingTimeZone) {
    case "nz":
      start = nthSundayOfMonth(8, -1, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(3, 1, 3, 0, timeZoneValue);
      break;

    case "us":
      start = nthSundayOfMonth(10, 1, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(2, 2, 2, 0, timeZoneValue);
      break;

    case "mex":
      start = nthSundayOfMonth(9, -1, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(3, 1, 2, 0, timeZoneValue);
      break;

    case "chile":
      start = nthSundayOfMonth(8, 1, 1, 0, timeZoneValue);
      end = nthSundayOfMonth(3, 1, 1, 0, timeZoneValue);
      break;

    case "eu":
      start = nthSundayOfMonth(9, -1, 1, 0, 0);
      end = nthSundayOfMonth(2, -1, 1, 0, 0);
      break;

    case "amman":
      start = nthSundayOfMonth(9, -1, 1, 5, timeZoneValue);
      end = nthSundayOfMonth(2, -1, 1, 5, timeZoneValue);
      break;

    case "israel":
      start = nthSundayOfMonth(9, -1, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(2, -1, 1, 0, timeZoneValue);
      end.setDate(end.getDate() - 2);
      break;

    case "iran":
      let year = new Date().getFullYear();
      let [timeZoneSign, timeZoneString] = getTimeZoneString(timeZoneValue);
      start = new Date(
        year.toString() + "-09-22T00:00:00.000" + timeZoneSign + timeZoneString
      );
      end = new Date(
        year.toString() + "-03-22T00:00:00.000" + timeZoneSign + timeZoneString
      );
      break;

    case "aus":
      start = nthSundayOfMonth(9, 1, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(3, 1, 2, 0, timeZoneValue);
      break;

    case "fiji":
      start = nthSundayOfMonth(10, 2, 2, 0, timeZoneValue);
      end = nthSundayOfMonth(0, 2, 2, 0, timeZoneValue);
      break;

    default:
      return 0;
  }

  let today = new Date();
  return today > start || today < end ? 0 : 1;
}

// month = January (0) to December (11)
// n = 1st (1) ... last (-1)
// dayOfWeek = Sunday (0) to Saturday (6)
function nthSundayOfMonth(
  month: number,
  n: number,
  hours: number,
  dayOfWeek: number,
  timeZoneValue: number
) {
  let fullDate = new Date();
  let year = fullDate.getFullYear();

  // https://rosettacode.org/wiki/Find_the_last_Sunday_of_each_month#JavaScript
  const lastDay = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    lastDay[2] = 29;
  }

  if (n === -1) {
    fullDate.setFullYear(year, month, lastDay[month]);
    if (fullDate.getDay() < dayOfWeek) {
      fullDate.setDate(fullDate.getDate() - 7);
    }
    fullDate.setDate(fullDate.getDate() - (fullDate.getDay() - dayOfWeek));
  } else {
    fullDate.setFullYear(year, month, 1);
    fullDate.setDate(
      ((1 + dayOfWeek + 7 - fullDate.getDay()) % 7) + 7 * (n - 1)
    );
  }

  const [timeZoneSign, timeZoneString] = getTimeZoneString(timeZoneValue);

  fullDate = new Date(
    year.toString() +
      "-" +
      (month + 1).toString().padStart(2, "0") +
      "-" +
      fullDate
        .getDate()
        .toString()
        .padStart(2, "0") +
      "T" +
      hours.toString().padStart(2, "0") +
      ":00:00.000" +
      timeZoneSign +
      timeZoneString
  );
  return fullDate;
}

function getTimeZoneString(timeZoneValue: number) {
  let timeZoneSign = timeZoneValue >= 0 ? "+" : "-";
  let timeZoneHour = Math.abs(timeZoneValue);
  let timeZoneMin = Math.round((timeZoneValue % 1) * 60);
  let timeZoneString =
    timeZoneHour.toString().padStart(2, "0") +
    ":" +
    timeZoneMin.toString().padEnd(2, "0");

  return [timeZoneSign, timeZoneString];
}

async function runWithExponentialBackoff(
  task: () => void,
  failureDelay: number,
  backoffFactor: number,
  fetchDesc: string
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

function hideEntity(entity: HTMLElement) {
  entity.classList.add("hidden");
}

function showEntity(entity: HTMLElement) {
  entity.classList.remove("hidden");
}

function setEntityVisibility(entity: HTMLElement, visible: boolean) {
  (visible ? showEntity : hideEntity)(entity);
}

function setButtonSelected(button: HTMLElement, selected: boolean) {
  const classAdded = selected ? "btn-primary" : "btn-light";
  const classRemoved = selected ? "btn-light" : "btn-primary";
  button.classList.add(classAdded);
  button.classList.remove(classRemoved);
}

function removeEntityChildren(entity: HTMLElement) {
  while (entity.lastChild !== null) {
    entity.removeChild(entity.lastChild);
  }
}

//// Course and schedule utility functions
///// Course property queries

///// Course search

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

function coursePassesTextFilters(
  course: Course.CourseV3,
  textFilters: Record<string, string>
) {
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

function parseDaysInequality(inputDays: string) {
  for (const rel of filterInequalities)
    if (inputDays.startsWith(rel)) return rel;
  return "";
}

function generateDayFilter(course: Course.CourseV3) {
  const scheduleList = course.courseSchedule;
  let days = new Set();

  for (let schedule of scheduleList) {
    const str1 = schedule.scheduleDays.toLowerCase();
    const arr1 = [...str1];
    arr1.forEach(days.add, days);
  }
  return days;
}

function generateInputDays(input: string) {
  let days = new Set();
  const arr1 = [...input];
  arr1.forEach(days.add, days);
  return days;
}

function coursePassesDayFilter(course: Course.CourseV3, inputString: string) {
  const courseDays = generateDayFilter(course);
  const rel = parseDaysInequality(inputString);
  const inputDays = generateInputDays(
    inputString.substring(rel.length).toLowerCase()
  );

  switch (rel) {
    case "<=":
      // courseDays is a subset of inputDays
      return setSubset(courseDays, inputDays);
    case "":
    case ">=":
      // inputDays is a subset of courseDays
      return setSubset(inputDays, courseDays);
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
      return (
        setSubset(courseDays, inputDays) && inputDays.size != courseDays.size
      );
    case ">":
      // inputDays is a proper subset of courseDays
      return (
        setSubset(inputDays, courseDays) && inputDays.size != courseDays.size
      );
    default:
      return false;
  }
}

function setSubset<T>(a: Set<T>, b: Set<T>) {
  if (a.size > b.size) return false;
  for (const elem of a) if (!b.has(elem)) return false;
  return true;
}

///// Course scheduling

function courseConflictWithSchedule(
  course: Course.CourseV3,
  starredOnly: boolean
) {
  const schedule = computeSchedule(gSelectedCourses);

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

function courseInSchedule(course: Course.CourseV3) {
  const schedule = computeSchedule(gSelectedCourses);

  for (let existingCourse of schedule) {
    if (Course.equal(existingCourse, course)) {
      return true;
    }
  }
  return false;
}

function computeSchedule(courses: Course.CourseV3[]) {
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
        Course.mutuallyExclusive(course, existingCourse) ||
        Course.conflict(course, existingCourse)
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

///// Course schedule queries

function computeCreditCountDescription(schedule: Course.CourseV3[]) {
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

function courseAlreadyAdded(course: Course.CourseV3) {
  return _.some((selectedCourse: Course.CourseV3) => {
    return selectedCourse.courseCode === course.courseCode;
  }, gSelectedCourses);
}

/// API retrieval

async function retrieveAPI(endpoint: string) {
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

function setMotd() {
  // TODO: incorporate these messages into the API, so that they can be
  // dynamically updated and don't need to be hard-coded?  or maybe it doesn't
  // matter...
  motd.classList.add("visible", "priority-med");
  motd.appendChild(
    Redom.el("div", [
      Redom.el("p", [
        Redom.el("i.icon.ion-android-alert"),
        " Heads up! To address some ",
        Redom.el(
          "a",
          { href: "https://github.com/MuddCreates/hyperschedule/issues/158" },
          "some Portal issues"
        ),
        " related to Hyperschedule's course scraper, we've lowered the rate at which Hyperschedule data is updated."
      ]),
      Redom.el("p", [
        "This means you ",
        Redom.el("em", "can still use"),
        " Hyperschedule to plan your courses for the upcoming semester (Spring 2021), but beware that our data may not be fully up to date! For the latest and most accurate information, please refer to Portal."
      ])
    ])
  );
}

function attachListeners() {
  const ent = Course.createEntity("placeholder");
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
  sortable(".sortable-list", {
    forcePlaceholderSize: true,
    placeholder: Course.createEntity("placeholder").outerHTML
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
  selectedCoursesList.addEventListener("sortupdate", readSelectedCoursesList);
  selectedCoursesList.addEventListener("sortstart", () => {
    gCurrentlySorting = true;
  });
  selectedCoursesList.addEventListener("sortstop", () => {
    gCurrentlySorting = false;
  });

  courseSearchResults.addEventListener("scroll", rerenderCourseSearchResults);

  for (let i = 0; conflictCoursesRadios[i]; i++) {
    conflictCoursesRadios[i].addEventListener("click", () => {
      gGreyConflictCourses = greyConflictCoursesOptions[i];
      toggleConflictCourses();
    });
  }

  timeZoneDropdown.addEventListener("change", () => {
    let selectedTimeZone =
      timeZoneDropdown.options[timeZoneDropdown.selectedIndex];

    let timeZoneValue = parseFloat(selectedTimeZone.value);
    gTimeZoneValues = [];
    gTimeZoneValues.push(timeZoneValue);
    if (selectedTimeZone.classList.length > 0) {
      gTimeZoneValues.push(timeZoneValue + 1);
    }

    gTimeZoneId = parseInt(selectedTimeZone.id.substring(19));

    gTimeZoneSavings = checkTimeZoneSavings();

    toggleTimeZone();
  });

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
  clipboard.on("success", () => {
    if (!importExportCopyButton.classList.contains("copy-button-copied")) {
      importExportCopyButton.classList.add("copy-button-copied");
    }
  });
  clipboard.on("error", () => {
    importExportCopyButton.classList.add("copy-button-error");
  });

  $("#import-export-modal").on("hidden.bs.modal", () => {
    importExportCopyButton.classList.remove("copy-button-copied");
    importExportCopyButton.classList.remove("copy-button-error");
  });
}

//// DOM element creation

//// DOM queries

function processSearchText() {
  const searchText = courseSearchInput.value.trim().split(/\s+/);
  let filterKeywordsValues: string[] = [];
  for (let key of Object.keys(filterKeywords)) {
    filterKeywordsValues = filterKeywordsValues.concat(filterKeywords[key]);
  }
  let filtersText = [];
  let queryText = [];

  for (let text of searchText) {
    text = text.toLowerCase();
    if (
      _.some((filter: string) => {
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

function updateTimeZoneDropdown() {
  (document.getElementById(
    "time-zone-dropdown-" + gTimeZoneId.toString()
  ) as HTMLOptionElement).selected = true;
  timeZoneDropdown.dispatchEvent(new Event("change"));
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
            const course = gApiData!.data.courses[key];
            return (
              courseMatchesSearchQuery(course, query) &&
              coursePassesTextFilters(course, filters) &&
              (gShowClosedCourses || !Course.isClosed(course)) &&
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
  while (courseSearchResultsList.lastChild !== null) {
    // Make sure to remove from the end.
    courseSearchResultsList.removeChild(courseSearchResultsList.lastChild);
  }

  const numToShow =
    (document.documentElement.clientHeight / gCourseEntityHeight) * 3;
  const startIndex = Math.floor(
    (courseSearchResults.scrollTop - document.documentElement.clientHeight) /
      gCourseEntityHeight
  );

  const numAlreadyShown = courseSearchResultsList.childElementCount;
  const allCoursesDisplayed = true;
  // 0 in case of non-incremental update
  const numAdded = numAlreadyShown;

  for (
    let index = Math.max(startIndex, 0);
    index < Math.min(startIndex + numToShow, gFilteredCourseKeys.length);
    ++index
  ) {
    const course = gApiData.data.courses[gFilteredCourseKeys[index]];
    const alreadyAdded = courseAlreadyAdded(course);
    const entity = Course.createEntity(
      course,
      {
        add: addCourse,
        remove: removeCourse,
        toggleStarred: toggleCourseStarred,
        toggleSelected: toggleCourseSelected,
        focus: setCourseDescriptionBox
      },
      { alreadyAdded }
    );
    entity.style.top = "" + gCourseEntityHeight * index + "px";
    courseSearchResultsList.appendChild(entity);
  }

  courseSearchResultsPlaceholder.style.height =
    gCourseEntityHeight * gFilteredCourseKeys.length + "px";

  courseSearchResultsEnd.textContent =
    gFilteredCourseKeys.length != 0 ? "End of results" : "No results";
}

function updateSelectedCoursesList() {
  // TODO REDOM

  if (gCurrentlySorting) {
    // Defer to after the user has finished sorting, otherwise we mess
    // up the drag and drop.
    setTimeout(updateSelectedCoursesList, 100);
    return;
  }
  while (selectedCoursesList.lastChild !== null) {
    selectedCoursesList.removeChild(selectedCoursesList.lastChild);
  }
  for (let idx = 0; idx < gSelectedCourses.length; ++idx) {
    const course = gSelectedCourses[idx];
    selectedCoursesList.appendChild(
      Course.createEntity(
        course,
        {
          add: addCourse,
          remove: removeCourse,
          toggleStarred: toggleCourseStarred,
          toggleSelected: toggleCourseSelected,
          focus: setCourseDescriptionBox
        },
        { idx, alreadyAdded: true }
      )
    );
  }
  sortable(".sortable-list");
}

function updateSchedule() {
  updateScheduleTimeZone();
  const schedule = computeSchedule(gSelectedCourses);
  while (scheduleTable.getElementsByClassName("schedule-slot").length > 0) {
    const element = scheduleTable.getElementsByClassName(
      "schedule-slot-wrapper"
    )[0];
    element.parentNode!.removeChild(element);
  }
  for (const course of schedule) {
    const entities = Course.createSlotEntities(course, setCourseDescriptionBox);
    entities.forEach(e => scheduleTable.appendChild(e));
  }
  creditCountText.textContent = computeCreditCountDescription(schedule);
}

function updateScheduleTimeZone() {
  for (let i = 0; scheduleTableDays[i]; i++) {
    // Earliest time in schedule is one day ahead if timeZoneValue is +9 or greater
    if (gTimeZoneValues[gTimeZoneSavings] >= 9.0) {
      scheduleTableDays[i].textContent = pacificScheduleDays[i + 2];
    } else {
      scheduleTableDays[i].textContent = pacificScheduleDays[i + 1];
    }
  }

  for (let i = 0; scheduleTableHours[i]; i++) {
    scheduleTableHours[i].textContent = TimeString.tzAdjusted(
      pacificScheduleTimes[i],
      gTimeZoneValues[gTimeZoneSavings] -
        pacificTimeZoneValues[gPacificTimeSavings]
    );
  }
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
  importExportTextArea.value = JSON.stringify(gSelectedCourses);
  $("#import-export-modal").modal("show");
}

function showSettingsModal() {
  $("#settings-modal").modal("show");
}

function setCourseDescriptionBox(course: Course.CourseV3) {
  gCourseSelected = course;

  while (courseDescriptionBox.lastChild !== null) {
    courseDescriptionBox.removeChild(courseDescriptionBox.lastChild);
  }
  const description = Course.generateDescription(
    course,
    gTimeZoneValues[gTimeZoneSavings] -
      pacificTimeZoneValues[gPacificTimeSavings]
  );
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

function updateCourseDescriptionTimeZone() {
  if (gCourseSelected !== null) setCourseDescriptionBox(gCourseSelected);
}

/// Global state handling
//// Combined update functions

function handleCourseSearchInputUpdate() {
  updateCourseSearchResults();
}

function handleSelectedCoursesUpdate() {
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
  updateTimeZoneDropdown();

  // Update course displays.
  updateCourseDisplays();

  // Canonicalize the state of local storage.
  writeStateToLocalStorage();
}

//// Global state mutation

function addCourse(course: Course.CourseV3) {
  if (courseAlreadyAdded(course)) {
    return;
  }
  course = deepCopy(course);
  course.selected = true;
  course.starred = false;
  gSelectedCourses.push(course);
  handleSelectedCoursesUpdate();
}

function removeCourse(course: Course.CourseV3) {
  gSelectedCourses.splice(gSelectedCourses.indexOf(course), 1);
  handleSelectedCoursesUpdate();
}

function readSelectedCoursesList() {
  const newSelectedCourses = [];
  for (let entity of selectedCoursesList.children) {
    const idx = parseInt(entity.getAttribute("data-course-index")!, 10);
    if (!isNaN(idx) && idx >= 0 && idx < gSelectedCourses.length) {
      newSelectedCourses.push(gSelectedCourses[idx]);
    } else {
      alert("An internal error occurred. This is bad.");
      updateSelectedCoursesList();
      return;
    }
  }
  gSelectedCourses = newSelectedCourses;
  handleSelectedCoursesUpdate();
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
  gSelectedCourses = obj.map(Course.upgrade);
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

function toggleTimeZone() {
  updateCourseDisplays();
  if (courseDescriptionBox.hasChildNodes()) {
    updateCourseDescriptionTimeZone();
  }
  writeStateToLocalStorage();
}

function toggleCourseSelected(course: Course.CourseV3) {
  course.selected = !course.selected;
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function toggleCourseStarred(course: Course.CourseV3) {
  course.starred = !course.starred;
  updateCourseDisplays();
  writeStateToLocalStorage();
}

function updateCourseDisplays() {
  updateCourseSearchResults();
  updateSelectedCoursesList();
  updateSchedule();
}

function displayCourseSearchColumn(ev: MouseEvent) {
  (<HTMLElement>ev.target).blur();
  gScheduleTabSelected = false;
  updateTabToggle();
  writeStateToLocalStorage();
}

function displayScheduleColumn(ev: MouseEvent) {
  (<HTMLElement>ev.target).blur();
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
function applyDiff(data: any, diff: any) {
  console.log("applying diff");
  if (!_.isObject(data) || !_.isObject(diff)) {
    return diff;
  }

  for (const key in diff) {
    const val = (<any>diff)[key];
    if (val === "$delete") {
      delete (<any>data)[key];
    } else if (!data.hasOwnProperty(key)) {
      (<any>data)[key] = val;
    } else {
      (<any>data)[key] = applyDiff((<any>data)[key], val);
    }
  }

  return data;
}

async function retrieveCourseData() {
  let apiEndpoint = "/api/v3/courses?school=hmc";
  if (gApiData !== null && gApiData.until !== undefined) {
    apiEndpoint += `&since=${gApiData.until}`;
  }
  const apiResponse = await retrieveAPI(apiEndpoint);
  if (apiResponse.error) {
    throw Error(`API error: ${apiResponse.error}`);
  }
  // Atomic update.
  let apiData = gApiData;
  let wasUpdated = false;
  console.log(`retrieved course data, full is ${apiResponse.full}`);
  if (apiData === null || apiResponse.full) {
    apiData = { data: apiResponse.data, until: apiResponse.until };
    wasUpdated = true;
  } else {
    const diff = apiResponse.data;
    if (!_.isEmpty(diff)) {
      wasUpdated = true;
      apiData.data = applyDiff(apiData.data, diff);
    }
  }
  apiData.until = apiResponse.until;

  for (const selectedCourse of gSelectedCourses) {
    if (apiData.data.courses.hasOwnProperty(selectedCourse.courseCode)) {
      Object.assign(
        selectedCourse,
        apiData!.data.courses[selectedCourse.courseCode]
      );
    }
  }

  if (wasUpdated) {
    const terms = Object.values(apiData.data.terms);
    terms.sort((t1: Term, t2: Term) =>
      SortKey.compare(t1.termSortKey, t2.termSortKey)
    );
    apiData.data.terms = {};
    terms.forEach((t: Term) => {
      apiData!.data.terms[t.termCode] = t;
    });

    const courses = Object.values(apiData.data.courses);
    courses.sort((t1: Course.CourseV3, t2: Course.CourseV3) =>
      SortKey.compare(t1.courseSortKey, t2.courseSortKey)
    );
    apiData.data.courses = {};
    courses.forEach((c: Course.CourseV3) => {
      apiData!.data.courses[c.courseCode] = c;
    });
  }

  gApiData = apiData;

  if (wasUpdated) {
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
    "scheduleTabSelected",
    JSON.stringify(gScheduleTabSelected)
  );
  localStorage.setItem("showClosedCourses", JSON.stringify(gShowClosedCourses));
  localStorage.setItem(
    "hideAllConflictingCourses",
    JSON.stringify(gHideAllConflictingCourses)
  );
  localStorage.setItem(
    "hideStarredConflictingCourses",
    JSON.stringify(gHideStarredConflictingCourses)
  );
  localStorage.setItem(
    "greyConflictCourses",
    JSON.stringify(gGreyConflictCourses)
  );
  localStorage.setItem("timeZoneValues", JSON.stringify(gTimeZoneValues));
  localStorage.setItem("timeZoneId", JSON.stringify(gTimeZoneId));
  localStorage.setItem("timeZoneSavings", JSON.stringify(gTimeZoneSavings));
}

function readStateFromLocalStorage() {
  gApiData = readFromLocalStorage("apiData", _.isObject, null);
  gSelectedCourses = readFromLocalStorage("selectedCourses", _.isArray, []).map(
    Course.upgrade
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
  gTimeZoneValues = readFromLocalStorage(
    "timeZoneValues",
    validateGTimeZoneValues,
    pacificTimeZoneValues
  );
  gTimeZoneId = readFromLocalStorage(
    "timeZoneId",
    _.isNumber,
    pacificTimeZoneId
  );
  gPacificTimeSavings = checkPST();
  gTimeZoneSavings = readFromLocalStorage(
    "timeZoneSavings",
    _.isNumber,
    gPacificTimeSavings
  );
}

function validateGGreyConflictCourses(value: string) {
  if (!_.isString(value)) {
    return false;
  }
  return greyConflictCoursesOptions.includes(value);
}

function validateGTimeZoneValues(value: number[] | number) {
  return _.isArray(value) || _.isNumber(value);
}

/// PDF download

function downloadPDF(starredOnly: boolean) {
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
  pdf.setFillColor("1"); // white

  // white background
  pdf.rect(0, 0, 11 * 72, 8.5 * 72, "F");

  // grid columns (alternating fill)
  for (let i = 0; i < 7; ++i) {
    const x = i * columnWidth + 1.25 * 72;

    pdf.setFillColor(i & 1 ? "1" : (230 / 255).toString());
    pdf.rect(x, 0.5 * 72, columnWidth, tableHeight, "F");

    // column header
    pdf.setFont("Helvetica", "bold");
    pdf.text(
      pacificScheduleDays[i],
      x + columnWidth / 2,
      0.5 * 72 + (0.25 * 72) / 2 + pdf.getLineHeight() / 2,
      { align: "center" }
    );
  }

  // grid rows
  pdf.setFont("Helvetica", "normal");
  for (let i = 0; i < 15; ++i) {
    const y = i * rowHeight + 0.75 * 72;
    pdf.line(0.5 * 72, y, 0.5 * 72 + tableWidth, y);

    pdf.text(
      TimeString.tzAdjusted(
        pacificScheduleTimes[i],
        gTimeZoneValues[gTimeZoneSavings] -
          pacificTimeZoneValues[gPacificTimeSavings]
      ),
      1.25 * 72 - 6,
      y + pdf.getLineHeight() + 3,
      { align: "right" }
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
      const [startHours, startMinutes] = TimeString.toHoursMinutes(
        slot.scheduleStartTime
      );
      const [endHours, endMinutes] = TimeString.toHoursMinutes(
        slot.scheduleEndTime
      );

      for (const day of slot.scheduleDays) {
        for (const [left, right] of Util.getConsecutiveRanges(
          slot.scheduleTerms
        )) {
          // Earliest time in schedule is one day ahead if timeZoneValue is +9 or greater
          const weekdayAdjustment =
            weekdayCharToInteger(day) +
            (gTimeZoneValues[gTimeZoneSavings] >= 9.0 ? 1 : 0);

          const x =
            weekdayAdjustment * columnWidth +
            1.25 * 72 +
            columnWidth * (left / slot.scheduleTermCount);

          const width =
            (columnWidth * (right - left + 1)) / slot.scheduleTermCount;

          const yStart =
            (startHours - 7 + startMinutes / 60) * rowHeight + 0.75 * 72;

          const yEnd = (endHours - 7 + endMinutes / 60) * rowHeight + 0.75 * 72;

          pdf.setFillColor(
            ...(<[number, number, number]>(
              (<unknown>Course.getColor(course, "rgbArray"))
            ))
          );

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
            Course.toInstructorLastNames(course),
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

          let entryNameToText: Record<string, string[]> = {
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

          pdf.setFont("Helvetica", "bold");
          pdf.text(courseCodeLines, xText, yText, { align: "center" });
          yText += courseCodeLines.length * pdf.getLineHeight();
          pdf.setFont("Helvetica", "normal");

          for (let entry of entriesByOrder) {
            if (entriesByPreference.slice(1, numEntries).includes(entry)) {
              pdf.text(entryNameToText[entry], xText, yText, {
                align: "center"
              });
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

function convertDayToICal(weekday: Weekday) {
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
function uglyHack(input: string) {
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
          Util.formatList(course.courseInstructors || [])
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
          const possibleWeekdayDifference = Util.mod(
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
        const [startHours, startMinutes] = TimeString.toHoursMinutes(
          slot.scheduleStartTime
        );
        start.setHours(startHours);
        start.setMinutes(startMinutes);
        const end = new Date(start.valueOf());
        const [endHours, endMinutes] = TimeString.toHoursMinutes(
          slot.scheduleEndTime
        );
        end.setHours(endHours);
        end.setMinutes(endMinutes);
        const freq = "WEEKLY";
        const until = listedEndDay;
        const interval = 1;
        const byday = (<Weekday[]>slot.scheduleDays.split("")).map(
          convertDayToICal
        );
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

setMotd();
attachListeners();
readStateFromLocalStorage();
handleGlobalStateUpdate();
retrieveCourseDataUntilSuccessful();

/// Closing remarks

// Local Variables:
// outline-regexp: "///+"
// End:
