const millisecondsPerHour = 3600 * 1000;
const scheduleHeightHeightPixels = 60;

const courseSearchToggle = document.getElementById('course-search-toggle');
const scheduleToggle = document.getElementById('schedule-toggle');

const courseSearchColumn = document.getElementById('course-search-column');
const scheduleColumn = document.getElementById('schedule-column');

const courseSearchInput = document.getElementById('course-search-course-name-input');
const courseSearchResultsList = document.getElementById('course-search-results-list');

const importExportDataButton = document.getElementById('import-export-data-button');

const selectedCoursesList = document.getElementById('selected-courses-list');

const scheduleTable = document.getElementById('schedule-table');
const scheduleTableBody = document.getElementById('schedule-table-body');

let courseData = null;
let selectedCourses = null;

// https://stackoverflow.com/a/2593661
function quoteRegexp(str)
{
  return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
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

function parseTime(timeString)
{
  return parseInt(timeString.substring(0, 2)) + parseInt(timeString.substring(3, 5)) / 60;
}

function writeStateToLocalStorage()
{
  localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
}

function readStateFromLocalStorage()
{
  selectedCourses = [];
  const jsonString = localStorage.getItem('selectedCourses');
  if (jsonString)
  {
    try
    {
      const obj = JSON.parse(jsonString);
      if (Array.isArray(obj))
      {
        selectedCourses = obj;
      }
    }
    catch (err)
    {
      // nothing to do here
    }
  }
}

function hideEntity(entity)
{
  entity.classList.add('hidden');
}

function showEntity(entity)
{
  entity.classList.remove('hidden');
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

function updateSortableLists()
{
  sortable('.sortable-list');
}

function scheduleSlotsEqual(slot1, slot2)
{
  for (let attr of [
    'days', 'location', 'startTime', 'endTime',
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
    'department', 'courseNumber', 'courseCodeSuffix', 'school', 'section',
    'courseName', 'quarterCredits', 'firstHalfSemester', 'secondHalfSemester',
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

function courseToString(course)
{
  return course.department + ' ' +
    course.courseNumber.toString().padStart(3, '0') +
    course.courseCodeSuffix + ' ' +
    course.school + '-' +
    course.section.toString().padStart(2, '0') + ' ' +
    course.courseName;
}

function coursesConflict(course1, course2)
{
  if (!(course1.firstHalfSemester && course2.firstHalfSemester) ||
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
      const start1 = parseTime(slot1.startTime);
      const end1 = parseTime(slot1.endTime);
      const start2 = parseTime(slot2.startTime);
      const end2 = parseTime(slot2.endTime);
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
    let conflicts = false;
    for (let existingCourse of schedule)
    {
      if (coursesConflict(course, existingCourse))
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

function createCourseEntity(course, idx)
{
  const listItem = document.createElement('li');
  listItem.classList.add('course-box');

  const listItemContent = document.createElement('div');
  listItemContent.classList.add('course-box-content');
  listItem.appendChild(listItemContent);

  const selectToggle = document.createElement('input');
  selectToggle.setAttribute('type', 'checkbox');
  selectToggle.classList.add('course-box-button');
  selectToggle.classList.add('course-box-toggle');
  selectToggle.classList.add('course-box-select-toggle');
  listItemContent.appendChild(selectToggle);

  const starToggle = document.createElement('input');
  starToggle.setAttribute('type', 'checkbox');
  starToggle.classList.add('course-box-button');
  starToggle.classList.add('course-box-toggle');
  starToggle.classList.add('course-box-star-toggle');
  listItemContent.appendChild(starToggle);

  const textBox = document.createElement('p');
  textBox.classList.add('course-box-text');
  listItemContent.appendChild(textBox);

  let text;
  if (course === 'placeholder')
  {
    text = 'placeholder';
  }
  else
  {
    text = courseToString(course);
  }
  const textNode = document.createTextNode(text);
  textBox.appendChild(textNode);

  const addButton = document.createElement('button');
  addButton.classList.add('course-box-button');
  addButton.classList.add('course-box-add-button');
  addButton.innerHTML = '+';
  addButton.addEventListener('click', () => {
    addCourse(course);
  });
  listItemContent.appendChild(addButton);

  const removeButton = document.createElement('button');
  removeButton.classList.add('course-box-button');
  removeButton.classList.add('course-box-remove-button');
  removeButton.innerHTML = '⨉';
  removeButton.addEventListener('click', () => {
    removeCourse(course);
  });
  listItemContent.appendChild(removeButton);

  if (course === 'placeholder')
  {
    listItem.classList.add('placeholder');
  }

  if (idx !== undefined)
  {
    listItem.setAttribute('data-course-index', idx);
  }

  return listItem;
}

function courseMatchesSearchQuery(course, query)
{
  const str = courseToString(course);
  for (let subquery of query)
  {
    if (!str.match(subquery))
    {
      return false;
    }
  }
  return true;
}

function getSearchQuery()
{
  return courseSearchInput.value.trim().split(/\s+/).map(subquery => {
    return new RegExp(quoteRegexp(subquery), 'i');
  });
}

function updateCourseSearchResults()
{
  const query = getSearchQuery();
  const courses = courseData.courses;
  const entities = courseSearchResultsList.children;
  for (let idx = 0; idx < courses.length; ++idx)
  {
    const course = courses[idx];
    const entity = entities[idx];
    const visible = courseMatchesSearchQuery(course, query);
    setEntityVisibility(entity, visible);
  }
}

function updateCourseSearchResultsList()
{
  while (courseSearchResultsList.hasChildNodes())
  {
    courseSearchResultsList.removeChild(courseSearchResultsList.lastChild);
  }
  for (let course of courseData.courses)
  {
    courseSearchResultsList.appendChild(createCourseEntity(course));
  }
  updateCourseSearchResults();
}

function updateSelectedCoursesList()
{
  while (selectedCoursesList.hasChildNodes())
  {
    selectedCoursesList.removeChild(selectedCoursesList.lastChild);
  }
  for (let idx = 0; idx < selectedCourses.length; ++idx)
  {
    const course = selectedCourses[idx];
    selectedCoursesList.appendChild(createCourseEntity(course, idx));
  }
  updateSortableLists();
}

function readSelectedCoursesList()
{
  const newSelectedCourses = [];
  for (let entity of selectedCoursesList.children)
  {
    const idx = parseInt(entity.getAttribute('data-course-index'));
    if (!isNaN(idx) && idx >= 0 && idx < selectedCourses.length)
    {
      newSelectedCourses.push(selectedCourses[idx]);
    }
    else
    {
      alert('An internal error occurred. This is bad.');
      updateSelectedCoursesList();
      return;
    }
  }
  selectedCourses = newSelectedCourses;
  updateSelectedCoursesList();
  updateSchedule();
  writeStateToLocalStorage();
}

function addCourse(course)
{
  let alreadyAdded = false;
  for (let idx = 0; idx < selectedCourses.length; ++idx)
  {
    if (coursesEquivalent(course, selectedCourses[idx]))
    {
      // Maybe some minor information (number of seats available) was
      // updated in the Portal. Let's update the existing class.
      selectedCourses[idx] = course;
      alreadyAdded = true;
    }
  }
  if (!alreadyAdded)
  {
    selectedCourses.push(course);
  }
  updateSelectedCoursesList();
  updateSchedule();
  writeStateToLocalStorage();
}

function removeCourse(course)
{
  selectedCourses = selectedCourses.filter(selectedCourse => {
    return !coursesEquivalent(course, selectedCourse);
  });
  updateSelectedCoursesList();
  updateSchedule();
  writeStateToLocalStorage();
}

function createSlotEntity(course, day, startTime, endTime)
{
  startTime = parseTime(startTime);
  endTime = parseTime(endTime);
  const timeSince8am = (startTime - 8);
  const duration = endTime - startTime;
  const text = course.courseName;
  const verticalOffsetPercentage = (timeSince8am + 1) / 16 * 100;
  const heightPercentage = duration / 16 * 100;
  const dayIndex = 'MTWRF'.indexOf(day);
  if (dayIndex === -1)
  {
    return null;
  }
  const horizontalOffsetPercentage = (dayIndex + 1) / 6 * 100;
  const style =
        `top: ${verticalOffsetPercentage}%; ` +
        `height: ${heightPercentage}%; ` +
        `left: ${horizontalOffsetPercentage}%;`;
  const div = document.createElement('div');
  div.setAttribute('style', style);
  div.classList.add('schedule-slot');

  const textContainer = document.createElement('p');
  textContainer.classList.add('schedule-slot-text-wrapper');
  div.appendChild(textContainer);

  const textNode = document.createTextNode(courseToString(course));
  textContainer.appendChild(textNode);

  return div;
}

function updateSchedule()
{
  const schedule = computeSchedule(selectedCourses);
  while (scheduleTable.getElementsByClassName('schedule-slot').length > 0)
  {
    const element = scheduleTable.getElementsByClassName('schedule-slot')[0];
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
}

async function retrieveCourseData()
{
  const response = await fetch('/api/v1/all-courses');
  if (!response.ok)
  {
    throw Error('Received API error while fetching course data: ' +
                response.status + ' ' + response.statusText);
  }
  courseData = await response.json();
  setTimeout(updateCourseSearchResultsList, 0);
}

async function retrieveCourseDataUntilSuccessful()
{
  let delay = 500;
  const backoffFactor = 1.5;
  while (true)
  {
    console.log('Attempting to fetch course data...');
    try
    {
      await retrieveCourseData();
      console.log('Successfully fetched course data.');
      break;
    }
    catch (err)
    {
      console.error(err);
      console.log(`Trying again in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }
}

function importExportData()
{
  const response = prompt(
    'You may edit your selected courses using an external tool:',
    JSON.stringify(selectedCourses));
  if (response === null)
  {
    return;
  }
  try
  {
    const obj = JSON.parse(response);
    if (Array.isArray(obj))
    {
      selectedCourses = obj;
      updateSelectedCoursesList();
      updateSchedule();
      writeStateToLocalStorage();
      return;
    }
  }
  catch (err)
  {
    // nothing to do here
  }
  alert('That was not a valid JSON array! Refusing to save.');
}

function displayCourseSearchColumn()
{
  hideEntity(scheduleColumn);
  showEntity(courseSearchColumn);
}

function displayScheduleColumn()
{
  hideEntity(courseSearchColumn);
  showEntity(scheduleColumn);
}

function attachListeners()
{
  courseSearchToggle.addEventListener('click', displayCourseSearchColumn);
  scheduleToggle.addEventListener('click', displayScheduleColumn);
  courseSearchInput.addEventListener('keyup', updateCourseSearchResults);
  importExportDataButton.addEventListener('click', importExportData);
  sortable('.sortable-list', {
    forcePlaceholderSize: true,
    placeholder: createCourseEntity('placeholder').outerHTML,
  });
  selectedCoursesList.addEventListener('sortupdate', readSelectedCoursesList);
}

attachListeners();
readStateFromLocalStorage();
updateSelectedCoursesList();
updateSchedule();
writeStateToLocalStorage();
retrieveCourseDataUntilSuccessful();

// DEBUG
displayScheduleColumn();

// FIXME: Make the toggle highlight which side is active
// FIXME: Save which side of the toggle we're on
// FIXME: Center course text
// FIXME: Add detail view/selection
