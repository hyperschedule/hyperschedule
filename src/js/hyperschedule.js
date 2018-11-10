// To see the outline of this file from Emacs, run M-x
// outline-minor-mode and then press C-c @ C-t. To also show the
// top-level functions and variable declarations in each section, run
// M-x occur with the following query: ^\(///+\|const\|\(async \)?function\|let\)

/// Globals
//// Data constants

const millisecondsPerHour = 3600 * 1000;

const courseSearchPageSize = 20;

const courseSearchPagesShownStart = 3;
const extraPagesToLoad = 2;

const apiURL = "/api/courses.json";

//// DOM elements

const courseSearchToggle = document.getElementById("course-search-toggle");
const scheduleToggle = document.getElementById("schedule-toggle");

const closedCoursesToggle = document.getElementById("closed-courses-toggle");

const courseSearchColumn = document.getElementById("course-search-column");
const scheduleColumn = document.getElementById("schedule-column");

const courseSearchScheduleColumn = document.getElementById("course-search-schedule-column");
const courseSearchInput = document.getElementById("course-search-course-name-input");
const courseSearchResultsList = document.getElementById("course-search-results-list");

const importExportDataButton = document.getElementById("import-export-data-button");

const printButton = document.getElementById("print-button");

const courseDescriptionBox = document.getElementById("course-description-box");
const courseDescriptionBoxOuter = document.getElementById("course-description-box-outer");

const selectedCoursesList = document.getElementById("selected-courses-list");

const scheduleTable = document.getElementById("schedule-table");
const scheduleTableBody = document.getElementById("schedule-table-body");
const creditCountText = document.getElementById("credit-count");

const importExportTextArea = document.getElementById("import-export-text-area");
const importExportICalButton = document.getElementById('import-export-ical-button');
const importExportSaveChangesButton = document.getElementById("import-export-save-changes-button");
const importExportCopyButton = document.getElementById("import-export-copy-button");

const malformedCoursesList = document.getElementById("malformed-courses-list");

//// Global state

// Persistent data.
let gCourseList = [];
let gMalformedCourseCount = 0;
let gCourseDataTimestamp = null;
let gSelectedCourses = [];
let gScheduleTabSelected = false;
let gShowClosedCourses = true;

// Transient data.
let gCourseIndex = {};
let gSelectedCoursesIndex = {};
let gCurrentlySorting = false;
let gCourseSearchPagesShown = courseSearchPagesShownStart;
// gMaxCourseSearchPage starts as Infinity and stays infinity until we
// exhaust the search result, at which point, it is calculated and set.
let gMaxCourseSearchPage = Infinity;
let gNextIncrementalCourseSearchIndex = null;

/// Utility functions
//// JavaScript utility functions

function isString(obj)
{
  return typeof obj === "string" || obj instanceof String;
}

// https://stackoverflow.com/a/2593661
function quoteRegexp(str)
{
  return (str+"").replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

function arraysEqual(arr1, arr2, test)
{
  if (arr1.length !== arr2.length)
  {
    return false;
  }
  for (let idx = 0; idx < arr1.length; ++idx)
  {
    if (test ? !test(arr1[idx], arr2[idx]) : (arr1[idx] !== arr2[idx]))
    {
      return false;
    }
  }
  return true;
}

function compareArrays(arr1, arr2)
{
  let idx1 = 0;
  let idx2 = 0;
  while (idx1 < arr1.length && idx2 < arr2.length)
  {
    if (arr1[idx1] < arr2[idx2])
    {
      return -1;
    }
    else if (arr1[idx1] > arr2[idx2])
    {
      return 1;
    }
    else
    {
      ++idx1;
      ++idx2;
    }
  }
  if (arr1.length < arr2.length)
  {
    return -1;
  }
  else if (arr1.length > arr2.length)
  {
    return 1;
  }
  else
  {
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
    } else if(cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function formatList(list, none)
{
  if (list.length === 0)
  {
    if (none === undefined)
    {
      return "(none)";
    }
    else
    {
      return none || "(none)";
    }
  }
  else if (list.length === 1)
  {
    return list[0];
  }
  else if (list.length === 2)
  {
    return list[0] + " and " + list[1];
  }
  else {
    return list.slice(0, list.length - 1).join(", ") +
      ", and " + list[list.length - 1];
  }
}

function deepCopy(obj)
{
  return JSON.parse(JSON.stringify(obj));
}

function weekdayCharToInteger(weekday)
{
  const index = "UMTWRFS".indexOf(weekday);
  if (index < 0)
  {
    throw Error("Invalid weekday: " + weekday);
  }
  return index;
}

function readArrayFromLocalStorage(key)
{
  const jsonString = localStorage.getItem(key);
  if (!key)
  {
    return [];
  }
  try
  {
    const obj = JSON.parse(jsonString);
    if (Array.isArray(obj))
    {
      return obj;
    }
    else
    {
      return [];
    }
  }
  catch (err)
  {
    return [];
  }
}

function catchEvent(event)
{
  event.stopPropagation();
}

//// Time utility functions

function timeStringToHoursAndMinutes(timeString)
{
  return [parseInt(timeString.substring(0, 2), 10),
          parseInt(timeString.substring(3, 5), 10)];
}

function timeStringToHours(timeString)
{
  const [hours, minutes] = timeStringToHoursAndMinutes(timeString);
  return hours + minutes / 60;
}

function timeStringTo12HourString(timeString)
{
  let [hours, minutes] = timeStringToHoursAndMinutes(timeString);
  const pm = hours >= 12;
  hours -= 1;
  hours %= 12;
  hours += 1;
  return hours.toString().padStart(2, "0") + ":" +
    minutes.toString().padStart(2, "0") + " " + (pm ? "PM" : "AM");
}

async function runWithExponentialBackoff(
  task, failureDelay, backoffFactor, fetchDesc)
{
  while (true)
  {
    console.log(`Attempting to ${fetchDesc}...`);
    try
    {
      await task();
      break;
    }
    catch (err)
    {
      console.error(err);
      console.log(`Trying again to ${fetchDesc} in ${failureDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, failureDelay));
      failureDelay *= backoffFactor;
    }
  }
}

//// DOM utility functions

function hideEntity(entity)
{
  entity.classList.add("hidden");
}

function showEntity(entity)
{
  entity.classList.remove("hidden");
}

function setEntityVisibility(entity, visible)
{
  if (visible)
  {
    showEntity(entity);
  }
  else
  {
    hideEntity(entity);
  }
}

function setButtonSelected(button, selected)
{
  const classAdded = selected ? "btn-primary" : "btn-light";
  const classRemoved = selected ? "btn-light" : "btn-primary";
  button.classList.add(classAdded);
  button.classList.remove(classRemoved);
}

function removeEntityChildren(entity)
{
  while (entity.hasChildNodes())
  {
    entity.removeChild(entity.lastChild);
  }
}

//// Course and schedule utility functions
///// Course property queries

function courseToSortKey(course)
{
  return [
    course.department,
    course.courseNumber,
    course.courseCodeSuffix,
    course.school,
    course.section,
  ];
}

function compareCourses(course1, course2)
{
  return compareArrays(courseToSortKey(course1), courseToSortKey(course2));
}

function courseToIndexKey(course)
{
  return courseToSortKey(course).join("/");
}

function isCourseClosed(course)
{
  return course.courseStatus == "closed";
}

function courseCodeToString(course)
{
  return course.department + " " +
    course.courseNumber.toString().padStart(3, "0") +
    course.courseCodeSuffix + " " +
    course.school + "-" +
    course.section.toString().padStart(2, "0");
}

function courseToString(course)
{
  return course.courseName + " (" +
    course.courseStatus + ", " +
    course.openSeats + "/" +
    course.totalSeats + " seats filled)";
}

function generateCourseDescription(course)
{
  const description = [];

  const summaryLine = courseCodeToString(course) + " " + course.courseName;
  description.push(summaryLine);

  const times = course.schedule.map(generateScheduleSlotDescription);
  for (const time of times)
  {
    description.push(time);
  }

  const instructors = formatList(course.faculty);
  description.push(instructors);

  let partOfYear = "(malformed schedule)";
  if (course.firstHalfSemester && course.secondHalfSemester)
  {
    partOfYear = "Full-semester course";
  }
  else if (course.firstHalfSemester && !course.secondHalfSemester)
  {
    partOfYear = "First half-semester course";
  }
  else if (!course.firstHalfSemester && course.secondHalfSemester)
  {
    partOfYear = "Second half-semester course";
  }
  let credits = (course.quarterCredits / 4) + " credit" +
      (course.quarterCredits != 4 ? "s" : "");
  description.push(`${partOfYear}, ${credits}`);

  return description;
}

function getCourseColor(course, format = "hex")
{
  return randomColor({
    hue: "random",
    luminosity: "light",
    seed: CryptoJS.MD5(courseCodeToString(course)).toString(),
    format,
  });
}

///// Course search

function courseMatchesSearchQuery(course, query)
{
  const code = course.department +
        course.courseNumber.toString().padStart(3, "0") +
        course.courseCodeSuffix;
  const section = course.school + "-" +
        course.section.toString().padStart(2, "0");
  for (let subquery of query)
  {
    if (code.match(subquery) || section.match(subquery) ||
        course.courseName.match(subquery))
    {
      continue;
    }
    let foundMatch = false;
    for (let instructor of course.faculty)
    {
      if (instructor.match(subquery))
      {
        foundMatch = true;
        break;
      }
    }
    if (foundMatch)
    {
      continue;
    }
    return false;
  }
  return true;
}

///// Course scheduling

function generateScheduleSlotDescription(slot)
{
  return slot.days + " " + timeStringTo12HourString(slot.startTime) + " – " +
    timeStringTo12HourString(slot.endTime) + " at " + slot.location;
}

function scheduleSlotsEqual(slot1, slot2)
{
  for (let attr of [
    "days", "location", "startTime", "endTime",
  ]) {
    if (slot1[attr] !== slot2[attr])
    {
      return false;
    }
  }
  return true;
}

function coursesEquivalent(course1, course2)
{
  for (let attr of [
    "department", "courseNumber", "courseCodeSuffix", "school", "section",
    "courseName", "quarterCredits", "firstHalfSemester", "secondHalfSemester",
  ]) {
    if (course1[attr] !== course2[attr])
    {
      return false;
    }
  }
  if (!arraysEqual(course1.faculty, course2.faculty))
  {
    return false;
  }
  if (!arraysEqual(course1.schedule, course2.schedule, scheduleSlotsEqual))
  {
    return false;
  }
  return true;
}

function coursesMutuallyExclusive(course1, course2)
{
  return (course1.department === course2.department &&
          course1.courseNumber === course2.courseNumber &&
          course1.courseCodeSuffix === course2.courseCodeSuffix);
}

function coursesConflict(course1, course2)
{
  if (!(course1.firstHalfSemester && course2.firstHalfSemester) &&
      !(course1.secondHalfSemester && course2.secondHalfSemester))
  {
    return false;
  }
  for (let slot1 of course1.schedule)
  {
    for (let slot2 of course2.schedule)
    {
      let daysOverlap = false;
      for (let day1 of slot1.days)
      {
        if (slot2.days.indexOf(day1) !== -1)
        {
          daysOverlap = true;
          break;
        }
      }
      if (!daysOverlap)
      {
        continue;
      }
      const start1 = timeStringToHours(slot1.startTime);
      const end1 = timeStringToHours(slot1.endTime);
      const start2 = timeStringToHours(slot2.startTime);
      const end2 = timeStringToHours(slot2.endTime);
      if (end1 <= start2 || start1 >= end2)
      {
        continue;
      }
      else
      {
        return true;
      }
    }
  }
  return false;
}

function computeSchedule(courses)
{
  const schedule = [];
  for (let course of courses)
  {
    if (course.selected && course.starred)
    {
      schedule.push(course);
    }
  }
  for (let course of courses)
  {
    // We already took care of the starred courses up earlier.
    if (!course.selected || course.starred)
    {
      continue;
    }
    let conflicts = false;
    for (let existingCourse of schedule)
    {
      if (coursesMutuallyExclusive(course, existingCourse) ||
          coursesConflict(course, existingCourse))
      {
        conflicts = true;
        break;
      }
    }
    if (!conflicts)
    {
      schedule.push(course);
    }
  }
  return schedule;
}

///// Course schedule queries

function computeCreditCountDescription(schedule) {
  let onCampusStarredCredits = 0;
  let offCampusStarredCredits = 0;
  let onCampusCredits = 0;
  let offCampusCredits = 0;
  for (let course of schedule)
  {
    let credits = course.quarterCredits / 4;

    if (course.school === "HM")
    {
      onCampusCredits += credits;
      if (course.starred)
      {
        onCampusStarredCredits += credits;
      }
    }
    else
    {
      offCampusCredits += credits;
      if (course.starred)
      {
        offCampusStarredCredits += credits;
      }
    }
  }
  let totalCredits = onCampusCredits + 3 * offCampusCredits;
  let totalStarredCredits = onCampusStarredCredits + 3 * offCampusStarredCredits;

  const text = "Scheduled credits: " +
        onCampusCredits + " on-campus credit" + (onCampusCredits !== 1 ? "s" : "") +
        " (" + onCampusStarredCredits + " starred), " +
        offCampusCredits + " off-campus credit" + (offCampusCredits !== 1 ? "s" : "") +
        " (" + offCampusStarredCredits + " starred), " +
        totalCredits + " total credit" + (totalCredits !== 1 ? "s" : "") +
        " (" + totalStarredCredits + " starred)";
  return text;
}

/// API retrieval

async function retrieveAPI()
{
  const httpResponse = await fetch(apiURL);
  if (!httpResponse.ok)
  {
    throw Error(`Received API error for URL ${apiURL}: ` +
                `${httpResponse.status} ${httpResponse.statusText}`);
  }
  return await httpResponse.json();
}

async function retrieveMalformedCourses()
{
  return [];
}

/// DOM manipulation
//// DOM setup

function attachListeners()
{
  courseSearchToggle.addEventListener("click", displayCourseSearchColumn);
  scheduleToggle.addEventListener("click", displayScheduleColumn);
  closedCoursesToggle.addEventListener("click", toggleClosedCourses);
  courseSearchInput.addEventListener("keyup", handleCourseSearchInputUpdate);
  importExportDataButton.addEventListener("click", showImportExportModal);
  importExportICalButton.addEventListener("click", downloadICalFile);
  importExportSaveChangesButton.addEventListener(
    "click", saveImportExportModalChanges);
  sortable(".sortable-list", {
    forcePlaceholderSize: true,
    placeholder: createCourseEntity("placeholder").outerHTML,
  });
  printButton.addEventListener("click", downloadPDF);
  selectedCoursesList.addEventListener("sortupdate", readSelectedCoursesList);
  selectedCoursesList.addEventListener("sortstart", () => {
    gCurrentlySorting = true;
  });
  selectedCoursesList.addEventListener("sortstop", () => {
    gCurrentlySorting = false;
  });
  window.addEventListener("resize", updateCourseDescriptionBoxHeight);

  // Attach import/export copy button
  let clipboard = new Clipboard("#import-export-copy-button");
  clipboard.on("success", (e) => {
    if (!importExportCopyButton.classList.contains("copy-button-copied"))
    {
      importExportCopyButton.classList.add("copy-button-copied");
    }
  });
  clipboard.on("error", (e) => {
    importExportCopyButton.classList.add("copy-button-error");
  });

  $("#import-export-modal").on("hidden.bs.modal", () => {
    importExportCopyButton.classList.remove("copy-button-copied");
    importExportCopyButton.classList.remove("copy-button-error");
  });
}

function updateNumCourseSearchPagesDisplayed()
{
  let currentScrollPosition = courseSearchScheduleColumn.scrollTop;
  let scrollMaxPosition = courseSearchScheduleColumn.scrollHeight;
  let scrollHeightLeft = scrollMaxPosition - currentScrollPosition;
  let screenHeight = document.documentElement.clientHeight;

  if (scrollHeightLeft < 2 * screenHeight)
  {
    setCourseSearchPagesDisplayed("more");
  }
}

function autoUpdateNumCourseSearchPagesDisplayed()
{
  updateNumCourseSearchPagesDisplayed();
  setTimeout(autoUpdateNumCourseSearchPagesDisplayed, 100);
}

//// DOM element creation

function createCourseLoadingMessage()
{
  const listItem = document.createElement("li");
  listItem.id = "course-search-placeholder";
  listItem.setAttribute("data-placeholder", "true");
  const text = document.createTextNode("Loading courses...");
  listItem.appendChild(text);
  return listItem;
}

function createCourseSearchEndOfResult(hasResult = true)
{
  const listItem = document.createElement("li");
  listItem.id = "course-search-placeholder";
  listItem.setAttribute("data-placeholder", "true");
  let text;
  if (hasResult)
  {
    text = document.createTextNode("End of results");
  }
  else
  {
    text = document.createTextNode("No results");
  }
  listItem.setAttribute("style", "color: grey");
  listItem.appendChild(text);
  if (gMalformedCourseCount)
  {
    listItem.appendChild(document.createElement("br"));
    const coursesWere =
          (gMalformedCourseCount === 1) ? "course was" : "courses were";
    const them =
          (gMalformedCourseCount === 1) ? "it" : "them";
    const hintText = document.createTextNode(
      `${gMalformedCourseCount} ${coursesWere} omitted from results ` +
      `because the registrar entered malformed data for ${them} – `);
    listItem.appendChild(hintText);
    const link = document.createElement("a");
    link.appendChild(document.createTextNode("click here for more details"));
    link.href = "javascript:showMalformedCoursesModal()";
    listItem.appendChild(link);
  }
  return listItem;
}

function createCourseEntity(course, attrs)
{
  attrs = attrs || {};
  const idx = attrs.idx;
  const alreadyAdded = attrs.alreadyAdded;

  const listItem = document.createElement("li");
  listItem.classList.add("course-box");

  const listItemContent = document.createElement("div");
  listItemContent.classList.add("course-box-content");
  if (course !== "placeholder")
  {
    listItemContent.style["background-color"] = getCourseColor(course);
  }
  listItemContent.addEventListener("click", () => {
    setCourseDescriptionBox(course);
  });
  listItem.appendChild(listItemContent);

  const selectLabel = document.createElement("label");
  selectLabel.classList.add("course-box-select-label");

  const selectIcon = document.createElement("i");
  selectIcon.classList.add("course-box-select-icon");
  selectIcon.classList.add("icon");
  if (!!course.selected) {
    selectLabel.classList.add("course-selected");
    selectIcon.classList.add("ion-android-checkbox");
  }
  else
  {
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
    }
    else
    {
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

  if (course !== "placeholder")
  {
    starLabel.classList.add("star-visible");
  }
  starToggle.checked = !!course.starred;
  if (!!course.starred) {
    starLabel.classList.add("star-checked");
    starIcon.classList.add("ion-android-star");
  }
  else
  {
    starIcon.classList.add("ion-android-star-outline");
  }
  starToggle.addEventListener("change", () => {
    if (starLabel.classList.contains("star-checked"))
    {
      starLabel.classList.remove("star-checked");
      starIcon.classList.remove("ion-android-star");
      starIcon.classList.add("ion-android-star-outline");
    }
    else
    {
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
  if (course === "placeholder")
  {
    courseCode = "placeholder";
    text = "placeholder";
  }
  else
  {
    courseCode = courseCodeToString(course);
    text = courseToString(course);
  }

  const courseCodeContainer = document.createElement("span");
  const courseCodeNode = document.createTextNode(courseCode);
  courseCodeContainer.classList.add("course-box-course-code");
  courseCodeContainer.appendChild(courseCodeNode);

  const courseNameNode = document.createTextNode(text);

  textBox.appendChild(courseCodeContainer);
  textBox.appendChild(courseNameNode);

  if (!alreadyAdded)
  {
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

  if (course === "placeholder")
  {
    listItem.classList.add("placeholder");
  }

  if (idx !== undefined)
  {
    listItem.setAttribute("data-course-index", idx);
  }

  return listItem;
}

function createSlotEntity(course, day, startTime, endTime)
{
  startTime = timeStringToHours(startTime);
  endTime = timeStringToHours(endTime);
  const timeSince8am = (startTime - 8);
  const duration = endTime - startTime;
  const text = course.courseName;
  const verticalOffsetPercentage = (timeSince8am + 1) / 16 * 100;
  const heightPercentage = duration / 16 * 100;
  const dayIndex = "MTWRF".indexOf(day);
  if (dayIndex === -1)
  {
    return null;
  }
  let halfSemesterHorizontalOffset = 0;
  let halfSemesterWidthOffset = 0;
  if (!course.firstHalfSemester && !course.secondHalfSemester)
  {
    return null;
  }
  if (!course.firstHalfSemester || !course.secondHalfSemester)
  {
    halfSemesterWidthOffset = -0.5;
  }
  if (!course.firstHalfSemester)
  {
    halfSemesterHorizontalOffset = 0.5;
  }
  const horizontalOffsetPercentage =
        (dayIndex + 1 + halfSemesterHorizontalOffset) / 6 * 100;
  const widthPercentage = (1 + halfSemesterWidthOffset) / 6 * 100;
  const style =
        `top: ${verticalOffsetPercentage}%; ` +
        `left: ${horizontalOffsetPercentage}%; ` +
        `width: ${widthPercentage}%; ` +
        `height: ${heightPercentage}%; `;

  const wrapper = document.createElement("div");
  wrapper.setAttribute("style", style);
  wrapper.classList.add("schedule-slot-wrapper");

  const div = document.createElement("div");
  wrapper.appendChild(div);

  div.classList.add("schedule-slot");
  if (course.starred)
  {
    div.classList.add("schedule-slot-starred");
  }

  div.style["background-color"] = getCourseColor(course);

  wrapper.addEventListener("click", () => {
    setCourseDescriptionBox(course);
  });

  const courseCodeContainer = document.createElement("p");
  const courseNameContainer = document.createElement("p");
  const courseCodeNode = document.createTextNode(courseCodeToString(course));
  const courseNameNode = document.createTextNode(
    course.courseName + " (" + course.openSeats + "/" + course.totalSeats + ")");
  courseCodeContainer.classList.add("schedule-slot-course-code");
  courseNameContainer.classList.add("schedule-slot-course-name");
  courseCodeContainer.appendChild(courseCodeNode);
  courseNameContainer.appendChild(courseNameNode);

  const textContainer = document.createElement("p");
  textContainer.classList.add("schedule-slot-text-wrapper");

  textContainer.appendChild(courseCodeContainer);
  textContainer.appendChild(courseNameContainer);

  div.appendChild(textContainer);


  return wrapper;
}

//// DOM queries

function getSearchQuery()
{
  return courseSearchInput.value.trim().split(/\s+/).map(subquery => {
    return new RegExp(quoteRegexp(subquery), "i");
  });
}

//// DOM updates
///// DOM updates due to global state change

function updateTabToggle()
{
  setEntityVisibility(scheduleColumn, gScheduleTabSelected);
  setButtonSelected(scheduleToggle, gScheduleTabSelected);

  setEntityVisibility(courseSearchColumn, !gScheduleTabSelected);
  setButtonSelected(courseSearchToggle, !gScheduleTabSelected);
}

function updateShowClosedCoursesCheckbox()
{
  closedCoursesToggle.checked = gShowClosedCourses;
}

function updateCourseSearchResults(attrs)
{
  attrs = attrs || {};
  const incremental = attrs.incremental;

  if (!incremental)
  {
    gMaxCourseSearchPage = Infinity;
    gNextIncrementalCourseSearchIndex = null;
  }

  if (gCourseList.length === 0)
  {
    let child;
    while ((child = courseSearchResultsList.lastChild))
    {
      courseSearchResultsList.removeChild(child);
    }
    courseSearchResultsList.appendChild(createCourseLoadingMessage());
    return;
  }

  let numToShow = gCourseSearchPagesShown * courseSearchPageSize;

  // Remove courses that should no longer be shown (or all courses, if
  // updating non-incrementally).
  while (courseSearchResultsList.childElementCount >
         (incremental ? numToShow : 0))
  {
    // Make sure to remove from the end.
    courseSearchResultsList.removeChild(courseSearchResultsList.lastChild);
  }

  let numAlreadyShown = courseSearchResultsList.childElementCount;
  const query = getSearchQuery();
  let allCoursesDisplayed = true;
  // 0 in case on non-incremental update
  let numAdded = numAlreadyShown;
  let courseListIndex = gNextIncrementalCourseSearchIndex || 0;
  for (; courseListIndex < gCourseList.length; ++courseListIndex)
  {
    const course = gCourseList[courseListIndex];
    const matchesQuery = courseMatchesSearchQuery(course, query);
    if (matchesQuery && (gShowClosedCourses || !isCourseClosed(course)))
    {
      if (numAdded >= numToShow)
      {
        // If we've already added all the courses we were supposed to,
        // abort.
        allCoursesDisplayed = false;
        break;
      }
      ++numAdded;
      const key = courseToIndexKey(course);
      const alreadyAdded = gSelectedCoursesIndex.hasOwnProperty(key);
      courseSearchResultsList.appendChild(
        createCourseEntity(course, { alreadyAdded }));
    }
  }
  gNextIncrementalCourseSearchIndex = courseListIndex;
  if (allCoursesDisplayed)
  {
    let hasResult = numAdded != 0;
    courseSearchResultsList.appendChild(createCourseSearchEndOfResult(hasResult));
    gMaxCourseSearchPage = Math.ceil(numAdded / courseSearchPageSize);
    gCourseSearchPagesShown = gMaxCourseSearchPage;
  }
}

function updateSelectedCoursesList()
{
  if (gCurrentlySorting)
  {
    // Defer to after the user has finished sorting, otherwise we mess
    // up the drag and drop.
    setTimeout(updateSelectedCoursesList, 100);
    return;
  }
  while (selectedCoursesList.hasChildNodes())
  {
    selectedCoursesList.removeChild(selectedCoursesList.lastChild);
  }
  for (let idx = 0; idx < gSelectedCourses.length; ++idx)
  {
    const course = gSelectedCourses[idx];
    selectedCoursesList.appendChild(createCourseEntity(course, { idx }));
  }
  sortable(".sortable-list");
}

function updateSchedule()
{
  const schedule = computeSchedule(gSelectedCourses);
  while (scheduleTable.getElementsByClassName("schedule-slot").length > 0)
  {
    const element =
          scheduleTable.getElementsByClassName("schedule-slot-wrapper")[0];
    element.parentNode.removeChild(element);
  }
  for (let course of schedule)
  {
    for (let slot of course.schedule)
    {
      for (let day of slot.days)
      {
        const entity = createSlotEntity(
          course, day, slot.startTime, slot.endTime);
        if (entity)
        {
          scheduleTable.appendChild(entity);
        }
      }
    }
  }
  creditCountText.textContent = computeCreditCountDescription(schedule);
}

///// DOM updates due to display changes

function updateCourseDescriptionBoxHeight() {
  if (!courseDescriptionBoxOuter.classList
      .contains("course-description-box-visible")) {
    return;
  }
  courseDescriptionBoxOuter.style.height =
    "" + courseDescriptionBox.scrollHeight + "px";
}

///// DOM updates miscellaneous

function showImportExportModal()
{
  importExportTextArea.value = JSON.stringify(gSelectedCourses, 2);
  $("#import-export-modal").modal("show");
}

function showMalformedCoursesModal()
{
  removeEntityChildren(malformedCoursesList);
  const courses = gMalformedCourseCount === 1 ? "course" : "courses";
  malformedCoursesList.appendChild(document.createTextNode(
    `Loading ${gMalformedCourseCount} malformed ${courses}...`));
  $("#malformed-courses-modal").modal("show");
  runWithExponentialBackoff(async () => {
    const malformedCourses = await retrieveMalformedCourses();
    console.log("Successfully fetched malformed courses.");
    removeEntityChildren(malformedCoursesList);
    if (malformedCourses.length !== 0)
    {
      const ul = document.createElement("ul");
      for (const malformedCourse of malformedCourses)
      {
        const li = document.createElement("li");
        li.appendChild(document.createTextNode(malformedCourse));
        ul.appendChild(li);
      }
      malformedCoursesList.appendChild(ul);
    }
    else
    {
      malformedCoursesList.appendChild(document.createTextNode(
        "No malformed courses."));
    }
  }, 500, 1.4, "fetch malformed courses");
}

function setCourseDescriptionBox(course)
{
  while (courseDescriptionBox.hasChildNodes())
  {
    courseDescriptionBox.removeChild(courseDescriptionBox.lastChild);
  }
  const description = generateCourseDescription(course);
  for (let idx = 0; idx < description.length; ++idx)
  {
    const line = description[idx];
    if (idx !== 0)
    {
      courseDescriptionBox.appendChild(document.createElement("hr"));
    }
    const paragraph = document.createElement("p");
    const text = document.createTextNode(line);
    paragraph.appendChild(text);
    courseDescriptionBox.appendChild(paragraph);
  }

  if (!courseDescriptionBoxOuter.classList.contains("course-description-box-visible")) {
    courseDescriptionBoxOuter.classList.add("course-description-box-visible");
  }

  updateCourseDescriptionBoxHeight();
}

/// Global state handling
//// Combined update functions

function handleCourseSearchInputUpdate()
{
  gCourseSearchPagesShown = courseSearchPagesShownStart;
  updateCourseSearchResults();
}

function handleSelectedCoursesUpdate()
{
  // We need to add/remove the "+" buttons.
  updateCourseSearchResults();

  // Obviously the selected courses list needs to be rebuilt.
  updateSelectedCoursesList();

  // New courses might be placed on the schedule.
  updateSchedule();

  // Also save changes.
  writeStateToLocalStorage();
}

function handleGlobalStateUpdate()
{
  // Update UI elements.
  updateTabToggle();
  updateShowClosedCoursesCheckbox();

  // Update course displays.
  updateCourseSearchResults();
  updateSelectedCoursesList();
  updateSchedule();

  // Canonicalize the state of local storage.
  writeStateToLocalStorage();
}

//// Global state mutation

function addCourse(course)
{
  const key = courseToIndexKey(course);
  if (gSelectedCoursesIndex.hasOwnProperty(key))
  {
    // Course already added.
    return;
  }
  course = deepCopy(course);
  course.selected = true;
  course.starred = false;
  gSelectedCourses.push(course);
  gSelectedCoursesIndex[key] = course;
  handleSelectedCoursesUpdate();
}

function removeCourse(course)
{
  const key = courseToIndexKey(course);
  gSelectedCourses.splice(gSelectedCourses.indexOf(course), 1);
  delete gSelectedCoursesIndex[key];
  handleSelectedCoursesUpdate();
}

function readSelectedCoursesList()
{
  const newSelectedCourses = [];
  for (let entity of selectedCoursesList.children)
  {
    const idx = parseInt(entity.getAttribute("data-course-index"), 10);
    if (!isNaN(idx) && idx >= 0 && idx < gSelectedCourses.length)
    {
      newSelectedCourses.push(gSelectedCourses[idx]);
    }
    else
    {
      alert("An internal error occurred. This is bad.");
      updateSelectedCoursesList();
      return;
    }
  }
  gSelectedCourses = newSelectedCourses;
  gSelectedCoursesIndex = buildCourseIndex(gSelectedCourses);
  handleSelectedCoursesUpdate();
}

function saveImportExportModalChanges()
{
  let obj;
  try
  {
    obj = JSON.parse(importExportTextArea.value);
    if (!Array.isArray(obj))
    {
      throw Error();
    }
  }
  catch (err)
  {
    alert("Malformed JSON. Refusing to save.");
    return;
  }
  gSelectedCourses = obj;
  gSelectedCoursesIndex = buildCourseIndex(gSelectedCourses);
  handleSelectedCoursesUpdate();
  $("#import-export-modal").modal("hide");
}

function toggleClosedCourses()
{
  gShowClosedCourses = !gShowClosedCourses;
  updateCourseSearchResults();
  writeStateToLocalStorage();
}

function toggleCourseSelected(course)
{
  course.selected = !course.selected;
  updateSchedule();
  writeStateToLocalStorage();
}

function toggleCourseStarred(course)
{
  course.starred = !course.starred;
  updateSchedule();
  writeStateToLocalStorage();
}

function displayCourseSearchColumn()
{
  this.blur();
  gScheduleTabSelected = false;
  updateTabToggle();
  writeStateToLocalStorage();
}

function displayScheduleColumn()
{
  this.blur();
  gScheduleTabSelected = true;
  updateTabToggle();
  writeStateToLocalStorage();
}

function setCourseSearchPagesDisplayed(action)
{
  let numPages = gCourseSearchPagesShown;
  if (action === "one")
  {
    numPages = 1;
  }
  else if (action === "fewer")
  {
    --numPages;
  }
  else if (action === "more")
  {
    ++numPages;
  }
  else if (action === "all")
  {
    numPages = gMaxCourseSearchPage;
  }
  if (numPages !== null)
  {
    numPages = Math.max(numPages, 1);
    numPages = Math.min(numPages, gMaxCourseSearchPage);
  }
  if (numPages !== gCourseSearchPagesShown)
  {
    gCourseSearchPagesShown = numPages;
    updateCourseSearchResults({ incremental: true });
  }
}

//// Course retrieval

function buildCourseIndex(courseList)
{
  const index = {};
  for (let course of courseList)
  {
    const key = courseToIndexKey(course);
    index[key] = course;
  }
  return index;
}

async function retrieveCourseData()
{
  let maybeIncremental = false;
  const apiResponse = await retrieveAPI();
  // Just in case there is an unexpected error while executing the
  // following code, make sure to fetch a whole new copy of the
  // courses list next time, since the incremental update would be
  // messed up.
  gCourseDataTimestamp = null;
  let maybeCourseListChanged = true;
  const incremental = maybeIncremental && apiResponse.incremental;
  if (incremental)
  {
    const diff = apiResponse.diff;
    maybeCourseListChanged =
      Object.keys(diff.modified).length !== 0 ||
      Object.keys(diff.removed ).length !== 0 ||
      Object.keys(diff.added   ).length !== 0;
    for (const modified of diff.modified)
    {
      const key = courseToIndexKey(modified);
      if (gCourseIndex.hasOwnProperty(key))
      {
        // This updates both the index and the course list, since they
        // share a reference to the same object.
        Object.assign(gCourseIndex[key], modified);
      }
      maybeCourseListChanged = true;
    }
    for (const removed of diff.removed)
    {
      const key = courseToIndexKey(removed);
      if (gCourseIndex.hasOwnProperty(key))
      {
        const course = gCourseIndex[key];
        // The reference is shared, so we can remove by identity.
        gCourseList.splice(gCourseList.indexOf(course), 1);
      }
      delete gCourseIndex[key];
    }
    for (const added of diff.added)
    {
      const key = courseToIndexKey(added);
      const idx = binarySearch(gCourseList, added, compareCourses);
      if (idx >= 0)
      {
        // Shouldn't happen but we account for it anyway.
        Object.assign(courseList[idx], added);
      }
      else
      {
        const insertBeforeIndex = -idx - 1;
        gCourseList.splice(insertBeforeIndex, 0, added);
        gCourseIndex[key] = added;
      }
    }
  }
  else
  {
    gCourseList = apiResponse.courses;
    gCourseList.sort(compareCourses);
    gCourseIndex = buildCourseIndex(gCourseList);
    gSelectedCoursesIndex = buildCourseIndex(gSelectedCourses);
  }
  for (const key of Object.keys(gSelectedCoursesIndex))
  {
    if (gCourseIndex.hasOwnProperty(key))
    {
      Object.assign(gSelectedCoursesIndex[key], gCourseIndex[key]);
    }
  }
  // Previous versions of the API v2 did not return this field.
  gMalformedCourseCount = apiResponse.malformedCourseCount || 0;
  gCourseDataTimestamp = apiResponse.timestamp;
  setTimeout(() => {
    if (maybeCourseListChanged)
    {
      updateCourseSearchResults();
      updateSelectedCoursesList();
      updateSchedule();
    }
    // Timestamp may have been updated regardless.
    writeStateToLocalStorage();
  }, 0);
}

async function retrieveCourseDataUntilSuccessful()
{
  const pollInterval = 5 * 1000;
  await runWithExponentialBackoff(async () => {
    await retrieveCourseData();
    console.log("Successfully fetched course data.");
    console.log(`Polling again in ${pollInterval}ms.`);
    setTimeout(retrieveCourseDataUntilSuccessful, pollInterval);
  }, 500, 1.5, "fetch course data");
}

//// Local storage

function writeStateToLocalStorage()
{
  localStorage.setItem("courseList", JSON.stringify(gCourseList));
  localStorage.setItem("courseDataTimestamp", gCourseDataTimestamp);
  localStorage.setItem("selectedCourses", JSON.stringify(gSelectedCourses));
  localStorage.setItem("scheduleTabSelected", gScheduleTabSelected);
  localStorage.setItem("showClosedCourses", gShowClosedCourses);
}

function readStateFromLocalStorage()
{
  gCourseList = readArrayFromLocalStorage("courseList");
  gCourseList.sort(compareCourses);
  gCourseIndex = buildCourseIndex(gCourseList);
  gSelectedCourses = readArrayFromLocalStorage("selectedCourses");
  gSelectedCoursesIndex = buildCourseIndex(gSelectedCourses);
  gCourseDataTimestamp =
    parseInt(localStorage.getItem("courseDataTimestamp"), 10) || null;
  gScheduleTabSelected = localStorage.getItem("scheduleTabSelected") === "true";
  gShowClosedCourses = localStorage.getItem("showClosedCourses") !== "false";
}

/// PDF download

function downloadPDF()
{
  // initialize PDF object
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
    orientation: "l",
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
  for (let i = 0; i < 7; ++i)
  {
    const x = i * columnWidth + 1.25 * 72;

    pdf.setFillColor(i & 1 ? 255 : 230);
    pdf.rect(x, 0.5 * 72, columnWidth, tableHeight, "F");

    // column header
    pdf.setFontStyle("bold");
    pdf.text(
      x + columnWidth / 2,
      0.5 * 72 + 0.25 * 72 / 2 + pdf.getLineHeight() / 2,
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][i],
      "center",
    );
  }

  // grid rows
  pdf.setFontStyle("normal");
  for (let i = 0; i < 16; ++i)
  {
    const y = i * rowHeight + 0.75 * 72;
    pdf.line(0.5 * 72, y, 0.5 * 72 + tableWidth, y);

    pdf.text(1.25 * 72 - 6, y + pdf.getLineHeight() + 3, [
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
      "11:00 pm",
    ][i], "right");
  }

  // header underline
  pdf.line(1.25 * 72, 0.5 * 72, 1.25 * 72, 0.5 * 72 + tableHeight);

  // course entities
  for (const course of computeSchedule(gSelectedCourses))
  {
    for (const slot of course.schedule)
    {
      const [startHours, startMinutes] = timeStringToHoursAndMinutes(slot.startTime);
      const [endHours, endMinutes] = timeStringToHoursAndMinutes(slot.endTime);

      for (const day of slot.days)
      {
        const x = weekdayCharToInteger(day) * columnWidth + 1.25 * 72 +
              (course.firstHalfSemester ? 0 : columnWidth / 2);

        const width = (course.firstHalfSemester + course.secondHalfSemester) *
              (columnWidth / 2);

        const yStart = (startHours - 8 + startMinutes / 60) * rowHeight +
              0.75 * 72;

        const yEnd = (endHours - 8 + endMinutes / 60) * rowHeight +
              0.75 * 72;

        pdf.setFillColor(...getCourseColor(course, "rgbArray"));

        pdf.rect(x, yStart, width, yEnd - yStart, "F");

        const courseCodeLines = pdf.splitTextToSize(
          courseCodeToString(course),
          width - 12,
        );
        const courseNameLines = pdf.splitTextToSize(
          course.courseName,
          width - 12,
        );

        const xText = x + width / 2;
        const yText = (yStart + yEnd) / 2 -
              (courseCodeLines.length + courseNameLines.length) *
              pdf.getLineHeight() / 2 +
              pdf.getLineHeight();
        pdf.setFontStyle("bold");
        pdf.text(xText, yText, courseCodeLines, "center");
        pdf.setFontStyle("normal");
        pdf.text(
          xText,
          yText + courseCodeLines.length * pdf.getLineHeight(),
          courseNameLines,
          "center",
        );
      }
    }
  }

  // grid outline
  pdf.rect(.5 * 72, .5 * 72, tableWidth, tableHeight, "FS");

  // save PDF
  pdf.save("hyperschedule.pdf");
};


/// iCal download

function convertDayToICal(weekday)
{
  switch (weekday)
  {
    case "U": return "SU";
    case "M": return "MO";
    case "T": return "TU";
    case "W": return "WE";
    case "R": return "TH";
    case "F": return "FR";
    case "S": return "SA";
  }
  throw Error("Invalid weekday: " + weekday);
}

// See https://github.com/nwcell/ics.js/issues/26.
function uglyHack(input)
{
  return input.replace(/\n/g, "\\n").replace(/,/g, "\\,");
}

function downloadICalFile()
{
  if (gSelectedCourses.length === 0)
  {
    alert("You have not added any courses to export.");
    return;
  }
  const cal = ics();
  let anyStarred = false;
  let anySelected = false;
  for (let course of gSelectedCourses)
  {
    if (course.selected && course.starred)
    {
      anyStarred = true;
    }
    if (course.selected)
    {
      anySelected = true;
    }
  }
  for (let course of gSelectedCourses)
  {
    if (!anySelected || course.selected && (!anyStarred || course.starred))
    {
      const subject = course.courseName;
      const description = uglyHack(
        courseCodeToString(course) + " " +
          course.courseName + "\n" +
          formatList(course.faculty));
      const listedStartDay = new Date(course.startDate);
      const listedStartWeekday = listedStartDay.getDay();
      const listedEndDay = new Date(course.endDate);
      // The range is inclusive, but ics.js interprets it exclusively.
      listedEndDay.setDate(listedEndDay.getDate() + 1);
      for (let slot of course.schedule)
      {
        const location = uglyHack(slot.location);
        // Determine the first day of class. We want to pick the
        // weekday that occurs the soonest after (possibly on the same
        // day as) the listed start date.
        let startWeekday = null;
        let weekdayDifference = 7;
        for (let weekday of slot.days)
        {
          const possibleStartWeekday = weekdayCharToInteger(weekday);
          const possibleWeekdayDifference =
                (possibleStartWeekday - listedStartWeekday) % 7;
          if (possibleWeekdayDifference < weekdayDifference)
          {
            startWeekday = possibleStartWeekday;
            weekdayDifference = possibleWeekdayDifference;
          }
        }
        // See https://stackoverflow.com/a/563442/3538165.
        const start = new Date(listedStartDay.valueOf());
        start.setDate(start.getDate() + weekdayDifference);
        const [startHours, startMinutes] =
              timeStringToHoursAndMinutes(slot.startTime);
        start.setHours(startHours);
        start.setMinutes(startMinutes);
        const end = new Date(start.valueOf());
        const [endHours, endMinutes] =
              timeStringToHoursAndMinutes(slot.endTime);
        end.setHours(endHours);
        end.setMinutes(endMinutes);
        const freq = "WEEKLY";
        const until = listedEndDay;
        const interval = 1;
        const byday = slot.days.split("").map(convertDayToICal);
        const rrule = {
          freq, until, interval, byday,
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
autoUpdateNumCourseSearchPagesDisplayed();


/// Closing remarks

// Local Variables:
// outline-regexp: "///+"
// End:
