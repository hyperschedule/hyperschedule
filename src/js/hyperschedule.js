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

const apiURL = API_URL; // replaced by Babel with a string literal

//// DOM elements

const courseSearchToggle = document.getElementById("course-search-toggle");
const scheduleToggle = document.getElementById("schedule-toggle");

const closedCoursesToggle = document.getElementById("closed-courses-toggle");

const courseSearchScheduleColumn = document.getElementById("course-search-schedule-column");
const courseSearchColumn = document.getElementById("course-search-column");
const scheduleColumn = document.getElementById("schedule-column");

const courseSearchInput = document.getElementById("course-search-course-name-input");
const courseSearchResultsList = document.getElementById("course-search-results-list");

const selectedCoursesColumn = document.getElementById("selected-courses-column");
const importExportDataButton = document.getElementById("import-export-data-button");
const printButton = document.getElementById("print-button");

const addFolderButton = document.getElementById("add-folder-button");
const closeRightClickMenu = document.getElementById("close-right-click-menu")
const rightClickMenu = document.getElementById("right-click-menu");

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

//// Global state

// Persistent data.
let gApiData = null;
let gSelectedCoursesAndFolders = [];
let gExistingFolderNames = [];
let gScheduleTabSelected = false;
let gShowClosedCourses = true;

// Transient data.
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

// Modulo operator, because % computes remainder and not modulo.
function mod(n, m)
{
  let rem = n % m;
  if (rem < 0)
  {
    rem += m;
  }
  return rem;
}

// Convert YYYY-MM-DD to Date. Taken from
// https://stackoverflow.com/a/7151607/3538165.
function parseDate(dateStr)
{
  const [year, month, day] = dateStr.split("-");
  return new Date(year, month - 1, day);
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

function readFromLocalStorage(key, pred, def)
{
  const jsonString = localStorage.getItem(key);
  if (!jsonString)
  {
    return def;
  }
  try
  {
    const obj = JSON.parse(jsonString);
    if (pred(obj))
    {
      return obj;
    }
    else
    {
      return def;
    }
  }
  catch (err)
  {
    return def;
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

function isCourseClosed(course)
{
  return course.courseEnrollmentStatus == "closed";
}

function courseToString(course)
{
  return course.courseName + " (" +
    course.courseEnrollmentStatus + ", " +
    course.courseSeatsFilled + "/" +
    course.courseSeatsTotal + " seats filled)";
}

function courseToInstructorLastnames(course)
{
  return course.courseInstructors.map(fullName => fullName.split(",")[0]).join(",");
}

function termListDescription(terms, termCount)
{
  if (termCount > 10)
  {
    return "Complicated schedule";
  }

  if (termCount === 1)
  {
    return "Full-semester course";
  }

  const numbers = _.map(term => {
    switch (term)
    {
      case 0: return "first";
      case 1: return "second";
      case 2: return "third";
      case 3: return "fourth";
      case 4: return "fifth";
      case 5: return "sixth";
      case 6: return "seventh";
      case 7: return "eighth";
      case 8: return "ninth";
      case 9: return "tenth";
      default: return "unknown";
    }
  }, terms);

  const qualifier = (termCount => {
    switch (termCount)
    {
      case 2: return "half";
      case 3: return "third";
      case 4: return "quarter";
      case 5: return "fifth";
      case 6: return "sixth";
      case 7: return "seventh";
      case 8: return "eighth";
      case 9: return "ninth";
      case 10: return "tenth";
      default: return "unknown";
    }
  })(termCount);

  return _.capitalize(`${formatList(numbers)} ${qualifier}-semester course`);
}

function generateCourseDescription(course)
{
  const description = [];

  const summaryLine = course.courseCode + " " + course.courseName;
  description.push(summaryLine);

  const times = course.courseSchedule.map(generateScheduleSlotDescription);
  for (const time of times)
  {
    description.push(time);
  }

  const instructors = formatList(course.courseInstructors);
  description.push(instructors);

  let partOfYear;
  if (_.isEmpty(course.courseSchedule))
  {
    partOfYear = "No scheduled meetings";
  }
  else
  {
    const meeting = course.courseSchedule[0];
    partOfYear = termListDescription(
      meeting.scheduleTerms, meeting.scheduleTermCount
    );
  }
  const credits = parseFloat(course.courseCredits);
  const creditsString = credits + " credit" +
        (credits !== 1 ? "s" : "");
  description.push(`${partOfYear}, ${creditsString}`);

  if (course.courseDescription !== null)
  {
    description.push(course.courseDescription);
  }

  const enrollment = course.courseEnrollmentStatus.charAt(0).toUpperCase() +
    course.courseEnrollmentStatus.slice(1) + ", " +
    course.courseSeatsFilled + "/" +
    course.courseSeatsTotal + " seats filled";
  description.push(enrollment);

  return description;
}

function getCourseColor(course, format = "hex")
{
  return randomColor({
    hue: "random",
    luminosity: "light",
    seed: CryptoJS.MD5(course.courseCode).toString(),
    format,
  });
}

///// Course search

function courseMatchesSearchQuery(course, query)
{
  for (let subquery of query)
  {
    if (course.courseCode.match(subquery) ||
        course.courseCode.replace(/ /g, "").match(subquery) ||
        course.courseName.match(subquery))
    {
      continue;
    }
    let foundMatch = false;
    for (let instructor of course.courseInstructors)
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
  return slot.scheduleDays + " " + timeStringTo12HourString(slot.scheduleStartTime) + " – " +
    timeStringTo12HourString(slot.scheduleEndTime) + " at " + slot.scheduleLocation;
}

function courseInSameFolder(course1, course2)
{
  return (course1.folder == course2.folder && course1.folder && course2.folder)
}

function coursesMutuallyExclusive(course1, course2)
{
  return arraysEqual(course1.courseMutualExclusionKey,
                     course2.courseMutualExclusionKey);
}

function coursesConflict(course1, course2)
{
  for (let slot1 of course1.courseSchedule)
  {
    for (let slot2 of course2.courseSchedule)
    {
      const parts = math.lcm(slot1.scheduleTermCount, slot2.scheduleTermCount);
      if (!_.some(idx => (
        slot1.scheduleTerms.indexOf(idx / slot2.scheduleTermCount) != -1 &&
          slot2.scheduleTerms.indexOf(idx / slot1.scheduleTermCount) != -1
      ), _.range(0, parts)))
      {
        return false;
      }
      let daysOverlap = false;
      for (let day1 of slot1.scheduleDays)
      {
        if (slot2.scheduleDays.indexOf(day1) !== -1)
        {
          daysOverlap = true;
          break;
        }
      }
      if (!daysOverlap)
      {
        continue;
      }
      const start1 = timeStringToHours(slot1.scheduleStartTime);
      const end1 = timeStringToHours(slot1.scheduleEndTime);
      const start2 = timeStringToHours(slot2.scheduleStartTime);
      const end2 = timeStringToHours(slot2.scheduleEndTime);
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
          coursesConflict(course, existingCourse) || courseInSameFolder(course, existingCourse))
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

/**
 * Given an array of integers in sorted order, determine the beginning
 * and end of each run of consecutive integers. For example:
 *
 * getConsecutiveRanges([0,1,2,4,5,8,10,12,13,14,15,20])
 *   => [[0,2], [4,5], [8,8], [10,10], [12,15], [20,20]]
 */
function getConsecutiveRanges(nums)
{
  const groups = [];
  let group = [];
  _.forEach(([idx, num]) => {
    if (idx > 0 && nums[idx - 1] !== nums[idx] - 1)
    {
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
  for (let course of schedule)
  {
    let credits = parseFloat(course.courseCredits);
    totalCredits += credits;
    if (course.starred)
    {
      starredCredits += credits;
    }
  }
  return "Scheduled: " + totalCredits + " credit" +
    (totalCredits !== 1 ? "s" : "") + " (" +
    starredCredits + " starred)";
}

//// Global state queries

function courseAlreadyAdded(course)
{
  return _.some(selectedCourse => {
    return selectedCourse.courseCode === course.courseCode;
  }, gSelectedCoursesAndFolders);
}

/// API retrieval

async function retrieveAPI(endpoint)
{
  const httpResponse = await fetch(apiURL + endpoint);
  if (!httpResponse.ok)
  {
    throw Error(`Received API error for endpoint ${endpoint}: ` +
                `${httpResponse.status} ${httpResponse.statusText}`);
  }
  return await httpResponse.json();
}

/// DOM manipulation
//// DOM setup

function attachListeners()
{
  document.addEventListener("DOMContentLoaded", onResize);
  document.addEventListener("click",() => {
    rightClickMenu.classList.add("hide-right-click-menu");
    rightClickMenu.classList.remove("show-right-click-menu");
  });

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
    acceptFrom: '.folder-list'
  });
  sortable(".folder-list", {
    forcePlaceholderSize: true,
    placeholder: createCourseEntity("placeholder").outerHTML,
    acceptFrom: '.sortable-list, .folder-list'
  });
  printButton.addEventListener("click", downloadPDF);
  addFolderButton.addEventListener("click",addFolder);
  selectedCoursesList.addEventListener("contextmenu",(event) => {
    rightClickMenu.classList.add("show-right-click-menu"); 
    rightClickMenu.classList.remove("hide-right-click-menu");
    rightClickMenu.style.top =  event.clientY + 'px';
    rightClickMenu.style.left = event.clientX + 'px';
    window.event.returnValue = false;
  });
  closeRightClickMenu.addEventListener("click",() => {
    rightClickMenu.classList.add("hide-right-click-menu");
    rightClickMenu.classList.remove("show-right-click-menu");
  })

  selectedCoursesList.addEventListener("sortupdate", readSelectedCoursesList);
  selectedCoursesList.addEventListener("sortstart", () => {
    gCurrentlySorting = true;
  });
  selectedCoursesList.addEventListener("sortstop", () => {
    gCurrentlySorting = false;
  });
  window.addEventListener("resize", updateCourseDescriptionBoxHeight);
  window.addEventListener("resize", onResize);

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

function onResize() {
  updateCourseSearchBar();
  updateSelectedCoursesBar();
  updateSearchScheduleColumn();
  updateSelectedCoursesWrapper();
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

  const folderButtonContainer = document.createElement("div");
  folderButtonContainer.classList.add("dropdown");
  folderButtonContainer.classList.add("course-box-folder-button-container");

  const folderButton = document.createElement("button");
  folderButton.setAttribute("type","button");
  folderButton.setAttribute("data-toggle","dropdown");
  folderButton.classList.add("course-box-folder-button")
  folderButton.classList.add("dropdown-toggle");

  folderButtonContainer.appendChild(folderButton);

  const folderIcon = document.createElement("i");
  folderIcon.classList.add("icon");
  folderIcon.classList.add("ion-folder");

  folderButton.appendChild(folderIcon)

  const folderButtonDropdown = document.createElement("div");
  folderButtonDropdown.classList.add("dropdown-menu");

  const noFolderListing = document.createElement("span");
  noFolderListing.classList.add("dropdown-item");
  noFolderListing.appendChild(document.createTextNode("None"));
  folderButtonDropdown.append(noFolderListing)

  noFolderListing.addEventListener("click",() => {
    course.folder = null;

    handleFolderEvent();
  });

  for (let folderName of gExistingFolderNames)
  {
    const folderListing = document.createElement("span");
    folderListing.classList.add("dropdown-item");
    folderListing.appendChild(document.createTextNode(folderName));
    folderButtonDropdown.append(folderListing)

    folderListing.addEventListener("click",() => {
      course.folder = folderName;
      
      handleFolderEvent();
    });
  }

  folderButtonContainer.appendChild(folderButtonDropdown);

  listItemContent.appendChild(folderButtonContainer);

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

function createFolderEntity(folder, attrs)
{
  attrs = attrs || {};
  const idx = attrs.idx;

  const listItem = document.createElement("li");
  listItem.classList.add("folder-box");
  listItem.id = "folder";

  const folderHeader = document.createElement("div");
  folderHeader.classList.add("folder-box-content");
  
  folderHeader.style["background-color"] = getCourseColor(folder);

  const collapseLabel = document.createElement("label");
  collapseLabel.classList.add("folder-box-collapse-label");

  const collapseIcon = document.createElement("i");
  collapseIcon.classList.add("folder-box-collapse-icon");
  collapseIcon.classList.add("icon");
  if (!!folder.open) {
    collapseIcon.classList.add("ion-android-arrow-dropdown-circle");
  }
  else
  {
    collapseIcon.classList.add("ion-android-arrow-dropright-circle");
  }

  collapseLabel.appendChild(collapseIcon);
  folderHeader.appendChild(collapseLabel);

  folderHeader.appendChild(collapseLabel);

  folderHeader.addEventListener("click", () => {
    if (containedCourses.style.display == "none")
    {
      containedCourses.style.display = "block";
      collapseIcon.classList.remove("ion-android-arrow-dropright-circle");
      collapseIcon.classList.add("ion-android-arrow-dropdown-circle")
      folder.open = true;
    } else {
      containedCourses.style.display = "none";
      collapseIcon.classList.add("ion-android-arrow-dropright-circle");
      collapseIcon.classList.remove("ion-android-arrow-dropdown-circle")
      folder.open = false;
    }
  });
 
  listItem.appendChild(folderHeader);


  const headerLabel = document.createElement("label");
  headerLabel.addEventListener("click", catchEvent);
  headerLabel.classList.add("folder-box-text");

  const headerText = document.createElement("input");
  headerText.setAttribute("type","text");
  headerText.classList.add("folder-box-name");
  headerText.value = folder.folder;
  
  headerText.addEventListener("change",(name) => 
  {
    name = name.srcElement.value;
    if(gExistingFolderNames.indexOf(name) < 0)
    {
      let prevName = folder.folder;
      folder.folder = name;

      gExistingFolderNames.splice(gExistingFolderNames.indexOf(prevName), 1);
      gExistingFolderNames.push(name);

      for (let course of gSelectedCoursesAndFolders)
      {
        if (course.folder == prevName)
        {
          course.folder = name;
        }
      }
      handleFolderEvent();
    } else {
      alert("Can't have two folders with the same name!");
      updateSelectedCoursesList();
    }
  });
  headerLabel.appendChild(headerText);
  folderHeader.appendChild(headerLabel);

  const removeButton = document.createElement("i");
  removeButton.classList.add("folder-box-button");
  removeButton.classList.add("folder-box-remove-button");
  removeButton.classList.add("icon");
  removeButton.classList.add("ion-close");
  removeButton.addEventListener("click", () => {
    removeFolder(folder);
  });
  removeButton.addEventListener("click", catchEvent);
  folderHeader.appendChild(removeButton);

  const containedCourses = document.createElement("ul");
  containedCourses.classList.add("folder-box-content");
  containedCourses.classList.add("folder-list");

  if (!folder.open)
  {
    containedCourses.style.display = "none";
  }

  listItem.appendChild(containedCourses);

  containedCourses.addEventListener("sortupdate", readSelectedCoursesList);
  containedCourses.addEventListener("sortstart", () => {
    gCurrentlySorting = true;
  });
  containedCourses.addEventListener("sortstop", () => {
    gCurrentlySorting = false;
  });
  
  if (idx !== undefined)
  {
    listItem.setAttribute("data-course-index", idx);
  }

  return listItem;
}

function createSlotEntities(course, slot)
{
  const entities = [];
  for (const slot of course.courseSchedule)
  {
    const startTime = timeStringToHours(slot.scheduleStartTime);
    const endTime = timeStringToHours(slot.scheduleEndTime);
    const timeSince8am = (startTime - 8);
    const duration = endTime - startTime;
    const text = course.courseName;
    const verticalOffsetPercentage = (timeSince8am + 1) / 16 * 100;
    const heightPercentage = duration / 16 * 100;
    for (const day of slot.scheduleDays)
    {
      const dayIndex = "MTWRF".indexOf(day);
      if (dayIndex === -1)
      {
        continue;
      }

      for (const [left, right] of getConsecutiveRanges(slot.scheduleTerms))
      {
        const horizontalOffsetPercentage =
              (dayIndex + 1 + left / slot.scheduleTermCount) / 6 * 100;
        const widthPercentage = ((right - left + 1) / slot.scheduleTermCount) / 6 * 100;
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
        const courseCodeNode = document.createTextNode(course.courseCode);
        const courseNameNode = document.createTextNode(
          course.courseName + " (" + course.courseSeatsFilled + "/" + course.courseSeatsTotal + ")");
        courseCodeContainer.classList.add("schedule-slot-course-code");
        courseNameContainer.classList.add("schedule-slot-course-name");
        courseCodeContainer.appendChild(courseCodeNode);
        courseNameContainer.appendChild(courseNameNode);

        const textContainer = document.createElement("p");
        textContainer.classList.add("schedule-slot-text-wrapper");

        textContainer.appendChild(courseCodeContainer);
        textContainer.appendChild(courseNameContainer);

        div.appendChild(textContainer);

        entities.push(wrapper);
      }
    }
  }
  return entities;
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

  if (gApiData === null)
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
  // 0 in case of non-incremental update
  let numAdded = numAlreadyShown;
  let courseListIndex = gNextIncrementalCourseSearchIndex || 0;
  let index = 0;
  _.forEach((course) => {
    if (index++ < courseListIndex)
      return null;
    const matchesQuery = courseMatchesSearchQuery(course, query);
    if (matchesQuery && (gShowClosedCourses || !isCourseClosed(course)))
    {
      if (numAdded >= numToShow)
      {
        // If we've already added all the courses we were supposed to,
        // abort.
        allCoursesDisplayed = false;
        return false;
      }
      ++numAdded;
      const alreadyAdded = courseAlreadyAdded(course);
      courseSearchResultsList.appendChild(
        createCourseEntity(course, { alreadyAdded }));
    }
    return null;
  }, gApiData.data.courses);
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

  let currentFolder = null;
  let folderEntity;

  let coursesAndFoldersAdded = 0;

  const newSelectedCourses = [];

  for (let course of gSelectedCoursesAndFolders){
    if (course.isFolder)
    {
      let idx = coursesAndFoldersAdded;
      folderEntity = createFolderEntity(course, { idx });
      newSelectedCourses.push(course);
      coursesAndFoldersAdded += 1;
      for (let comparisonCourse of gSelectedCoursesAndFolders)
      {
        if(!comparisonCourse.isFolder && comparisonCourse.folder == course.folder){
          let idx = coursesAndFoldersAdded;
          folderEntity.lastChild.appendChild(createCourseEntity(comparisonCourse, { idx }));
          newSelectedCourses.push(comparisonCourse);
          coursesAndFoldersAdded += 1;
        }
      }
      selectedCoursesList.appendChild(folderEntity);
    } else if (course.folder == null) {
      let idx = coursesAndFoldersAdded;
      selectedCoursesList.appendChild(createCourseEntity(course, { idx }));
      newSelectedCourses.push(course);
      coursesAndFoldersAdded += 1;
    }
  }

  gSelectedCoursesAndFolders = newSelectedCourses;

  sortable(".sortable-list");
  sortable(".folder-list");
}

function updateSchedule()
{
  const schedule = computeSchedule(gSelectedCoursesAndFolders);
  while (scheduleTable.getElementsByClassName("schedule-slot").length > 0)
  {
    const element =
          scheduleTable.getElementsByClassName("schedule-slot-wrapper")[0];
    element.parentNode.removeChild(element);
  }
  for (let course of schedule)
  {
    const entities = createSlotEntities(course);
    _.forEach(e => scheduleTable.appendChild(e), entities);
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

  courseDescriptionBoxOuter.style.marginBottom = "9px";
}

function updateCourseSearchBar() {
  if (courseSearchColumn.classList.contains("hidden")) {
    return;
  }

  const courseSearchInputWrapper = document.getElementById("course-search-course-name-input-wrapper");
  const courseClosedToggleWrapper = document.getElementById("closed-courses-toggle-wrapper");
  const courseClosedToggleLabel = document.getElementById("closed-courses-toggle-label");
  const helpButtonWrapper = document.getElementById("help-button-wrapper");
  const helpButton = document.getElementById("help-button");

  // default value
  let tableValue = "table-cell";
  let marginValue = "0 auto";

  let minSearchInputWidth = 100;
  if (courseSearchColumn.offsetWidth < 
    (minSearchInputWidth + courseClosedToggleLabel.offsetWidth + helpButton.offsetWidth)) {
    tableValue = "table-row";
    marginValue = "5px auto";
  }
  courseSearchInputWrapper.style.display = tableValue;
  courseSearchInput.style.margin = marginValue;
  courseClosedToggleWrapper.style.display = tableValue;
  courseClosedToggleLabel.style.margin = marginValue;
  helpButtonWrapper.style.display = tableValue;
  helpButton.style.margin = marginValue;
}

function updateSelectedCoursesBar() {
  const githubLink = document.getElementById("github-link");
  const importExportButtonWrapper = document.getElementById("import-export-data-button-wrapper");
  const printButtonWrapper = document.getElementById("print-button-wrapper");

  // default values
  let tableValue = "table-cell";
  let floatValue = "right";
  let marginValue = "0 auto";
  let printPaddingLeftValue = "10px";

  let linkWidth = 150;
  if (selectedCoursesColumn.offsetWidth <
    (linkWidth + importExportDataButton.offsetWidth + printButton.offsetWidth)) {
    tableValue = "table-row";
    floatValue = "left";
    marginValue = "5px auto";
    printPaddingLeftValue = "0px";
  }
  githubLink.style.display = tableValue;
  importExportButtonWrapper.style.display = tableValue;
  importExportDataButton.style.float = floatValue;
  importExportDataButton.style.margin = marginValue;
  printButtonWrapper.style.display = printButtonWrapper;
  printButtonWrapper.style.paddingLeft = printPaddingLeftValue;
  printButton.style.float = floatValue;
  printButton.style.margin = marginValue;
}

function updateSearchScheduleColumn() {
  const searchScheduleToggleBar = document.getElementById("course-search-schedule-toggle-bar");
  const courseSearchBar = document.getElementById("course-search-bar");
  const columnPaddingTop = 20;

  const placeholderHeight = 50;
  const listHeight = courseSearchScheduleColumn.offsetHeight
    - columnPaddingTop
    - searchScheduleToggleBar.offsetHeight
    - courseSearchBar.offsetHeight
    - placeholderHeight;
  courseSearchResultsList.style.height = "" + listHeight + "px";

  const scheduleHeight = courseSearchScheduleColumn.offsetHeight
    - columnPaddingTop
    - searchScheduleToggleBar.offsetHeight;
  scheduleColumn.style.height = "" + scheduleHeight + "px";
}

function updateSelectedCoursesWrapper() {
  const selectedCoursesWrapper = document.getElementById("selected-courses-wrapper");
  const selectedCoursesBar = document.getElementById("selected-courses-bar");

  const columnPaddingTop = 20;
  const wrapperMarginTop = 8;
  const wrapperHeight = selectedCoursesColumn.offsetHeight
    - columnPaddingTop
    - selectedCoursesBar.offsetHeight
    - wrapperMarginTop;
  selectedCoursesWrapper.style.height = "" + wrapperHeight + "px";
}

function updateSelectedCoursesBar() {
  const githubLink = document.getElementById("github-link");
  const importExportButtonWrapper = document.getElementById("import-export-data-button-wrapper");
  const printButtonWrapper = document.getElementById("print-button-wrapper");

  // default values
  let tableValue = "table-cell";
  let floatValue = "right";
  let marginValue = "0 auto";
  let printPaddingLeftValue = "10px";

  let linkWidth = 150;
  if (selectedCoursesColumn.offsetWidth <
    (linkWidth + importExportDataButton.offsetWidth + printButton.offsetWidth)) {
    tableValue = "table-row";
    floatValue = "left";
    marginValue = "5px auto";
    printPaddingLeftValue = "0px";
  }
  githubLink.style.display = tableValue;
  importExportButtonWrapper.style.display = tableValue;
  importExportDataButton.style.float = floatValue;
  importExportDataButton.style.margin = marginValue;
  printButtonWrapper.style.display = printButtonWrapper;
  printButtonWrapper.style.paddingLeft = printPaddingLeftValue;
  printButton.style.float = floatValue;
  printButton.style.margin = marginValue;
}

function updateSearchScheduleColumn() {
  const searchScheduleToggleBar = document.getElementById("course-search-schedule-toggle-bar");
  const courseSearchBar = document.getElementById("course-search-bar");
  const columnPaddingTop = 20;

  const placeholderHeight = 50;
  const listHeight = courseSearchScheduleColumn.offsetHeight
    - columnPaddingTop
    - searchScheduleToggleBar.offsetHeight
    - courseSearchBar.offsetHeight
    - placeholderHeight;
  courseSearchResultsList.style.height = "" + listHeight + "px";

  const scheduleHeight = courseSearchScheduleColumn.offsetHeight
    - columnPaddingTop
    - searchScheduleToggleBar.offsetHeight;
  scheduleColumn.style.height = "" + scheduleHeight + "px";
}

function updateSelectedCoursesWrapper() {
  const selectedCoursesWrapper = document.getElementById("selected-courses-wrapper");
  const selectedCoursesBar = document.getElementById("selected-courses-bar");

  const columnPaddingTop = 20;
  const wrapperMarginTop = 8;
  const wrapperHeight = selectedCoursesColumn.offsetHeight
    - columnPaddingTop
    - selectedCoursesBar.offsetHeight
    - wrapperMarginTop;
  selectedCoursesWrapper.style.height = "" + wrapperHeight + "px";
}

///// DOM updates miscellaneous

function showImportExportModal()
{
  importExportTextArea.value = JSON.stringify(gSelectedCoursesAndFolders, 2);
  $("#import-export-modal").modal("show");
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

function handleFolderEvent()
{
  updateSelectedCoursesList();
  updateSchedule();
  writeStateToLocalStorage();
}

//// Global state mutation

function addCourse(course)
{
  if (courseAlreadyAdded(course))
  {
    return;
  }
  course = deepCopy(course);
  course.selected = true;
  course.starred = false;
  course.folder = null;
  course.isFolder = false;
  gSelectedCoursesAndFolders.push(course);
  handleSelectedCoursesUpdate();
}

function addFolder()
{
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let counter = 1;
  let name = null;
  while (!name)
  {
    if(gExistingFolderNames.indexOf("Folder "+counter) < 0)
    {
      name = "Folder "+ counter;
    } else {
      counter += 1;
    }
  }

  let folder = {
    selected: false,
    starred: false,
    open: true,
    isFolder: true,
    courseCode: randomString,
    folder: name
  }
  gExistingFolderNames.push(name);
  gSelectedCoursesAndFolders.push(folder);
  handleSelectedCoursesUpdate();
 }

function removeCourse(course)
{
  gSelectedCoursesAndFolders.splice(gSelectedCoursesAndFolders.indexOf(course), 1);
  handleSelectedCoursesUpdate();
}

function removeFolder(folder)
{
  gSelectedCoursesAndFolders.splice(gSelectedCoursesAndFolders.indexOf(folder), 1);
  for (let course of gSelectedCoursesAndFolders)
  {
    if (course.folder == folder.folder)
    {
      course.folder = null;
    }
  }
  gExistingFolderNames.splice(gExistingFolderNames.indexOf(folder.name), 1);
  handleSelectedCoursesUpdate();
}

function readSelectedCoursesList()
{
  const newSelectedCourses = [];
  for (let entity of selectedCoursesList.children)
  {
    const idx = parseInt(entity.getAttribute("data-course-index"), 10);
    if (!isNaN(idx) && idx >= 0 && idx < gSelectedCoursesAndFolders.length)
    {
      newSelectedCourses.push(gSelectedCoursesAndFolders[idx]);
    }
    else
    {
      alert("An internal error occurred. This is bad.");
      updateSelectedCoursesList();
      return;
    }
    if (entity.lastChild.nodeName == "UL")
    {
      for (let subentity of entity.lastChild.children)
      {
        const idx = parseInt(subentity.getAttribute("data-course-index"), 10);
        if (!isNaN(idx) && idx >= 0 && idx < gSelectedCoursesAndFolders.length)
        {
          newSelectedCourses.push(gSelectedCoursesAndFolders[idx]);
        }
        else
        {
          alert("An internal error occurred. This is bad.");
          updateSelectedCoursesList();
          return;
        }
      }
    }
  }
  gSelectedCoursesAndFolders = newSelectedCourses;
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
  gSelectedCoursesAndFolders = upgradeSelectedCourses(obj);
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

/**
 * Given an arbitrary data value and an arbitrary diff (see the
 * documentation for the Hyperschedule backend for information about
 * the format of diffs), apply the diff and return a new data object.
 * The original data object may have been mutated.
 */
function applyDiff(data, diff)
{
  if (!_.isObject(data) || !_.isObject(diff))
  {
    return diff;
  }

  _.forEach.convert({cap: false})((val, key) => {
    if (val === "$delete")
    {
      _.unset(data, key);
    }
    else if (!_.has(data, key))
    {
      _.set(data, key, val);
    }
    else
    {
      _.set(data, key, applyDiff(_.get(data, key), val));
    }
  }, diff);

  return data;
}

async function retrieveCourseData()
{
  let apiEndpoint = "/api/v3/courses?school=hmc";
  if (gApiData !== null)
  {
    apiEndpoint += `&since=${gApiData.until}`;
  }
  const apiResponse = await retrieveAPI(apiEndpoint);
  if (apiResponse.error)
  {
    throw Error(`API error: ${apiResponse.error}`);
  }
  // Atomic update.
  let apiData = gApiData;
  let wasUpdated = false;
  if (apiResponse.full)
  {
    apiData = _.pick(["data", "until"], apiResponse);
    wasUpdated = true;
  }
  else
  {
    const diff = apiResponse.data;
    if (!_.isEmpty(diff)) {
      wasUpdated = true;
      apiData.data = applyDiff(apiData.data, diff);
    }
    apiData.until = apiResponse.until;
  }
  for (const selectedCourse of gSelectedCoursesAndFolders)
  {
    if (_.has(selectedCourse.courseCode, apiData.data.courses))
    {
      _.assign(selectedCourse, apiData.data.courses[selectedCourse.courseCode]);
    }
  }

  if (wasUpdated)
  {
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

  if (wasUpdated)
  {
    updateCourseSearchResults();
    updateSelectedCoursesList();
    updateSchedule();
  }

  // API data was updated regardless.
  writeStateToLocalStorage();
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
  localStorage.setItem("apiData", JSON.stringify(gApiData));
  localStorage.setItem("selectedCourses", JSON.stringify(gSelectedCoursesAndFolders));
  localStorage.setItem("folderNames", JSON.stringify(gExistingFolderNames));
  localStorage.setItem("scheduleTabSelected", gScheduleTabSelected);
  localStorage.setItem("showClosedCourses", gShowClosedCourses);
}

function oldCourseToString(course)
{
  return course.department + " " +
    course.courseNumber.toString().padStart(3, "0") +
    course.courseCodeSuffix + " " +
    course.school + "-" +
    course.section.toString().padStart(2, "0");
}

function upgradeSelectedCourses(selectedCourses)
{
  return _.map(course => {
    if (!_.has("quarterCredits", course))
    {
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
        course.school,
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
          (course.firstHalfSemester && course.secondHalfSemester) ? 1 : 2,
          scheduleTerms: !course.firstHalfSemester ? [1] : [0],
        };
      }, course.schedule),
      courseSeatsFilled: course.openSeats,
      courseSeatsTotal: course.totalSeats,
      courseSortKey: [
        course.department,
        course.courseNumber,
        course.courseCodeSuffix,
        course.school,
        course.section,
      ],
      courseTerm: "Unknown",
      courseWaitlistLength: null,
      selected: course.selected,
      starred: course.starred,
    };
  }, selectedCourses);
}

function readStateFromLocalStorage()
{
  gApiData = readFromLocalStorage("apiData", _.isObject, null);
  gSelectedCoursesAndFolders = upgradeSelectedCourses(
    readFromLocalStorage("selectedCourses", _.isArray, [])
  );
  gExistingFolderNames = readFromLocalStorage(
    "folderNames", _.isArray, []
  );
  gScheduleTabSelected = readFromLocalStorage(
    "scheduleTabSelected", _.isBoolean, false
  );
  gShowClosedCourses = readFromLocalStorage(
    "showClosedCourses", _.isBoolean, true
  );
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
  for (const course of computeSchedule(gSelectedCoursesAndFolders))
  {
    for (const slot of course.courseSchedule)
    {
      const [startHours, startMinutes] = timeStringToHoursAndMinutes(slot.scheduleStartTime);
      const [endHours, endMinutes] = timeStringToHoursAndMinutes(slot.scheduleEndTime);

      for (const day of slot.scheduleDays)
      {
        for (const [left, right] of getConsecutiveRanges(slot.scheduleTerms))
        {
          const x = weekdayCharToInteger(day) * columnWidth + 1.25 * 72 +
                columnWidth * (left / slot.scheduleTermCount);

          const width = columnWidth * (right - left + 1) / slot.scheduleTermCount;

          const yStart = (startHours - 8 + startMinutes / 60) * rowHeight +
                0.75 * 72;

          const yEnd = (endHours - 8 + endMinutes / 60) * rowHeight +
                0.75 * 72;

          pdf.setFillColor(...getCourseColor(course, "rgbArray"));

          pdf.rect(x, yStart, width, yEnd - yStart, "F");

          const courseCodeLines = pdf.splitTextToSize(
            course.courseCode,
            width - 12,
          );
          const courseNameLines = pdf.splitTextToSize(
            course.courseName,
            width - 12,
          );
          const courseLocationLines = pdf.splitTextToSize(
            slot.scheduleLocation,
            width - 12,
          );
          const courseInstructorsLines = pdf.splitTextToSize(
            courseToInstructorLastnames(course),
            width - 12
          );

          // Attributes to be shown are calculated based on space available
          // order of preference: Code, location, name, professor
          // order of display: code, name, professor, location

          const entriesByPreference = ["code", "location", "name", "instructor"];
          const entriesByOrder = ["code", "name", "instructor", "location"];

          let entryNameToText = {
            code: courseCodeLines,
            location: courseLocationLines,
            name: courseNameLines,
            instructor: courseInstructorsLines,
          };

          // Limits size of text to ensure some white space at top and bottom
          const maxTextLength = (yEnd - yStart) - 2 * pdf.getLineHeight();
          let numEntries = 0;
          let totalLength = 0;
          while (totalLength * pdf.getLineHeight() < maxTextLength &&
                 numEntries < entriesByPreference.length)
          {
            totalLength += entryNameToText[entriesByPreference[numEntries]].length;
            numEntries += 1;
          }

          const xText = x + width / 2;
          // Find height to start the text so that it will be centered in the block
          let yText = (yStart + yEnd) / 2 -
              totalLength * pdf.getLineHeight() / 2 +
              pdf.getLineHeight();

          pdf.setFontStyle("bold");
          pdf.text(xText, yText, courseCodeLines, "center");
          yText += courseCodeLines.length * pdf.getLineHeight();
          pdf.setFontStyle("normal");

          for (let entry of entriesByOrder)
          {
            if (entriesByPreference.slice(1, numEntries).includes(entry))
            {
              pdf.text(
                xText,
                yText,
                entryNameToText[entry],
                "center",
              );
              yText += entryNameToText[entry].length * pdf.getLineHeight();
            }
          }
        }
      }
    }
  }

  // grid outline
  pdf.rect(.5 * 72, .5 * 72, tableWidth, tableHeight, "S");

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
  if (gSelectedCoursesAndFolders.length === 0)
  {
    alert("You have not added any courses to export.");
    return;
  }
  const cal = ics();
  let anyStarred = false;
  let anySelected = false;
  for (let course of gSelectedCoursesAndFolders)
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
  for (let course of gSelectedCoursesAndFolders)
  {
    if ((!anySelected || course.selected) && (!anyStarred || course.starred))
    {
      const subject = course.courseName;
      const description = uglyHack(
        course.courseCode + " " +
          course.courseName + "\n" +
          formatList(course.courseInstructors));
      for (let slot of course.courseSchedule)
      {
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
        for (let weekday of slot.scheduleDays)
        {
          const possibleStartWeekday = weekdayCharToInteger(weekday);
          const possibleWeekdayDifference =
                mod(possibleStartWeekday - listedStartWeekday, 7);
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
              timeStringToHoursAndMinutes(slot.scheduleStartTime);
        start.setHours(startHours);
        start.setMinutes(startMinutes);
        const end = new Date(start.valueOf());
        const [endHours, endMinutes] =
              timeStringToHoursAndMinutes(slot.scheduleEndTime);
        end.setHours(endHours);
        end.setMinutes(endMinutes);
        const freq = "WEEKLY";
        const until = listedEndDay;
        const interval = 1;
        const byday = slot.scheduleDays.split("").map(convertDayToICal);
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
