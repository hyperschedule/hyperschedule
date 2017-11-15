const millisecondsPerHour = 3600 * 1000;
const scheduleHeightHeightPixels = 60;

const courseSearchToggle = document.getElementById('course-search-toggle');
const scheduleToggle = document.getElementById('schedule-toggle');

const courseSearchColumn = document.getElementById('course-search-column');
const scheduleColumn = document.getElementById('schedule-column');

const courseSearchInput = document.getElementById('course-search-course-name-input');
const courseSearchResultsList = document.getElementById('course-search-results-list');

const importExportDataButton = document.getElementById('import-export-data-button');

const printButton = document.getElementById('print-button');

const courseDescriptionBox = document.getElementById('course-description-box');
const courseDescriptionBoxOuter = document.getElementById('course-description-box-outer');

const selectedCoursesList = document.getElementById('selected-courses-list');

const scheduleTable = document.getElementById('schedule-table');
const scheduleTableBody = document.getElementById('schedule-table-body');
const creditCountText = document.getElementById('credit-count');

const importExportTextArea = document.getElementById('import-export-text-area');
const importExportSaveChangesButton = document.getElementById('import-export-save-changes-button');

let courseData = null;
let selectedCourses = null;
let schedule = null;
let scheduleTabSelected = false;

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

function formatList(list, none)
{
    if (list.length === 0)
    {
	if (none === undefined)
	{
	    return '(none)';
	}
	else
	{
	    return none || '(none)';
	}
    }
    else if (list.length === 1)
    {
	return list[0];
    }
    else if (list.length === 2)
    {
	return list[0] + ' and ' + list[1];
    }
    else {
	return list.slice(0, list.length - 1).join(', ') +
	    ', and ' + list[list.length - 1];
    }
}

function deepCopy(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

function parseTimeSeparately(timeString)
{
    return [parseInt(timeString.substring(0, 2)),
	    parseInt(timeString.substring(3, 5))];
}

function parseTime(timeString)
{
    const [hours, minutes] = parseTimeSeparately(timeString);
    return hours + minutes / 60;
}

function convertTimeTo12Hour(timeString)
{
    let [hours, minutes] = parseTimeSeparately(timeString);
    const pm = hours >= 12;
    hours -= 1;
    hours %= 12;
    hours += 1;
    return hours.toString().padStart(2, '0') + ':' +
	minutes.toString().padStart(2, '0') + ' ' + (pm ? 'PM' : 'AM');
}

function writeStateToLocalStorage()
{
    localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
    localStorage.setItem('scheduleTabSelected', scheduleTabSelected);
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
    scheduleTabSelected = localStorage.getItem('scheduleTabSelected') === 'true';
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

function coursesMutuallyExclusive(course1, course2)
{
    return (course1.department === course2.department &&
	    course1.courseNumber === course2.courseNumber &&
	    course1.courseCodeSuffix === course2.courseCodeSuffix);
}

function courseToString(course)
{
    return course.department + ' ' +
	course.courseNumber.toString().padStart(3, '0') +
	course.courseCodeSuffix + ' ' +
	course.school + '-' +
	course.section.toString().padStart(2, '0') + ' ' +
	course.courseName + ' (' +
	course.courseStatus + ', ' +
	course.openSeats + '/' +
	course.totalSeats + ' seats filled)';
}

function getCourseColor(course)
{
    return randomColor({
	luminosity: 'light',
	seed: course.department + ' ' +
	    course.courseNumber.toString().padStart(3, '0') +
	    course.courseCodeSuffix + ' ' +
	    course.school + '-' +
	    course.section.toString().padStart(2, '0'),
    });
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

function createCourseEntity(course, idx)
{
    const listItem = document.createElement('li');
    listItem.classList.add('course-box');

    const listItemContent = document.createElement('div');
    listItemContent.classList.add('course-box-content');
    if (course !== 'placeholder')
    {
	listItemContent.style['background-color'] = getCourseColor(course);
    }
    listItemContent.addEventListener('click', () => {
	setCourseDescriptionBox(course);
    });
    listItem.appendChild(listItemContent);

    const selectToggle = document.createElement('input');
    selectToggle.setAttribute('type', 'checkbox');
    selectToggle.classList.add('course-box-button');
    selectToggle.classList.add('course-box-toggle');
    selectToggle.classList.add('course-box-select-toggle');
    selectToggle.checked = !!course.selected;
    selectToggle.addEventListener('change', () => {
	toggleCourseSelected(course);
    });
    selectToggle.addEventListener('click', catchEvent);
    listItemContent.appendChild(selectToggle);

    const starLabel = document.createElement('label');
    starLabel.classList.add('course-box-star-label');

    const starToggle = document.createElement('input');
    starToggle.setAttribute('type', 'checkbox');
    starToggle.classList.add('course-box-button');
    starToggle.classList.add('course-box-toggle');
    starToggle.classList.add('course-box-star-toggle');
    if (course !== 'placeholder')
    {
	starLabel.classList.add('star-visible');
    }
    starToggle.checked = !!course.starred;
    if (!!course.starred) {
	starLabel.classList.add('star-checked');
    }
    starToggle.addEventListener('change', () => {
	if (starLabel.classList.contains('star-checked'))
	{
	    starLabel.classList.remove('star-checked');
	}
	else
	{
	    starLabel.classList.add('star-checked');
	}

	toggleCourseStarred(course);
    });
    starToggle.addEventListener('click', catchEvent);
    starLabel.addEventListener('click', catchEvent);

    starLabel.appendChild(starToggle);
    listItemContent.appendChild(starLabel);

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

    const addButton = document.createElement('i');
    addButton.classList.add('course-box-button');
    addButton.classList.add('course-box-add-button');
    addButton.classList.add('icon');
    addButton.classList.add('ion-plus');

    addButton.addEventListener('click', () => {
	addCourse(course);
    });
    addButton.addEventListener('click', catchEvent);
    listItemContent.appendChild(addButton);

    const removeButton = document.createElement('i');
    removeButton.classList.add('course-box-button');
    removeButton.classList.add('course-box-remove-button');
    removeButton.classList.add('icon');
    removeButton.classList.add('ion-close');
    // removeButton.innerHTML = '⨉';
    removeButton.addEventListener('click', () => {
	removeCourse(course);
    });
    removeButton.addEventListener('click', catchEvent);
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
    const code = course.department +
	  course.courseNumber.toString().padStart(3, '0') +
	  course.courseCodeSuffix;
    const section = course.school + '-' +
	  course.section.toString().padStart(2, '0');
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
  course = deepCopy(course);
  course.selected = true;
  course.starred = false;
  let alreadyAdded = false;
  for (let idx = 0; idx < selectedCourses.length; ++idx)
  {
    if (coursesEquivalent(course, selectedCourses[idx]))
    {
      // Maybe some minor information (number of seats available) was
      // updated in the Portal. Let's update the existing class.
      Object.assign(selectedCourses[idx], course);
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
  const div = document.createElement('div');
  div.setAttribute('style', style);
  div.classList.add('schedule-slot');
  if (course.starred)
  {
    div.classList.add('schedule-slot-starred');
  }
  div.style['background-color'] = getCourseColor(course);
  div.addEventListener('click', () => {
    setCourseDescriptionBox(course);
  });

  const textContainer = document.createElement('p');
  textContainer.classList.add('schedule-slot-text-wrapper');
  div.appendChild(textContainer);

  const textNode = document.createTextNode(courseToString(course));
  textContainer.appendChild(textNode);

  return div;
}

function updateSchedule()
{
  schedule = computeSchedule(selectedCourses);
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
  updateCreditCount();
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
  // Update things like seats open with data from Portal.
  for (let idx = 0; idx < selectedCourses.length; ++idx)
  {
    const selectedCourse = selectedCourses[idx];
    for (let course of courseData.courses)
    {
      if (coursesEquivalent(course, selectedCourse))
      {
        Object.assign(selectedCourses[idx], course);
        break;
      }
    }
  }
  setTimeout(() => {
    updateCourseSearchResultsList();
    updateSelectedCoursesList();
    updateSchedule();
  }, 0);
}

async function retrieveCourseDataUntilSuccessful()
{
  let delay = 500;
  const backoffFactor = 1.5;
  const pollInterval = 5 * 1000;
  while (true)
  {
    console.log('Attempting to fetch course data...');
    try
    {
      await retrieveCourseData();
      console.log('Successfully fetched course data.');
      console.log(`Polling again in ${pollInterval}ms.`);
      setTimeout(retrieveCourseDataUntilSuccessful, pollInterval);
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

function showImportExportModal()
{
  importExportTextArea.value = JSON.stringify(selectedCourses, 2);
  $('#import-export-modal').modal('show');
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
    alert('Malformed JSON. Refusing to save.');
    return;
  }
  selectedCourses = obj;
  updateSelectedCoursesList();
  updateSchedule();
  writeStateToLocalStorage();
  $('#import-export-modal').modal('hide');
}

function generateScheduleSlotDescription(slot)
{
  return slot.days + ' ' + convertTimeTo12Hour(slot.startTime) + ' - ' +
    convertTimeTo12Hour(slot.endTime) + ' at ' + slot.location;
}

function generateCourseDescription(course)
{
  const description = [];

  const summaryLine =
        course.department + ' ' +
        course.courseNumber.toString().padStart(3, '0') +
        course.courseCodeSuffix + ' ' +
        course.school + '-' +
        course.section.toString().padStart(2, '0') + ' ' +
        course.courseName;
  description.push(summaryLine);

  const times = course.schedule.map(generateScheduleSlotDescription);
  for (const time of times)
  {
    description.push(time);
  }

  const instructors = formatList(course.faculty);
  description.push(instructors);

  let partOfYear = '(malformed schedule)';
  if (course.firstHalfSemester && course.secondHalfSemester)
  {
    partOfYear = 'Full-semester course';
  }
  else if (course.firstHalfSemester && !course.secondHalfSemester)
  {
    partOfYear = 'First half-semester course';
  }
  else if (!course.firstHalfSemester && course.secondHalfSemester)
  {
    partOfYear = 'Second half-semester course';
  }
  let credits = (course.quarterCredits / 4) + ' credit' +
      (course.quarterCredits != 4 ? 's' : '');
  description.push(`${partOfYear}, ${credits}`);

  return description;
}

function updateCourseDescriptionBoxHeight() {
  if (!courseDescriptionBoxOuter.classList.contains('course-description-box-visible')) {
    return;
  }
  courseDescriptionBoxOuter.style.height = '' + courseDescriptionBox.scrollHeight + 'px';
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
      courseDescriptionBox.appendChild(document.createElement('hr'));
    }
    const paragraph = document.createElement('p');
    const text = document.createTextNode(line);
    paragraph.appendChild(text);
    courseDescriptionBox.appendChild(paragraph);
  }
  
  if (!courseDescriptionBoxOuter.classList.contains('course-description-box-visible')) {
    courseDescriptionBoxOuter.classList.add('course-description-box-visible');
  }

  updateCourseDescriptionBoxHeight();
  
}

function setButtonSelected(button, selected)
{
  const classAdded = selected ? 'btn-primary' : 'btn-light';
  const classRemoved = selected ? 'btn-light' : 'btn-primary';
  button.classList.add(classAdded);
  button.classList.remove(classRemoved);
}

function updateTabToggle()
{
  setEntityVisibility(scheduleColumn, scheduleTabSelected);
  setButtonSelected(scheduleToggle, scheduleTabSelected);

  setEntityVisibility(courseSearchColumn, !scheduleTabSelected);
  setButtonSelected(courseSearchToggle, !scheduleTabSelected);
}

function updateCreditCount()
{
  let onCampusStarredCredits = 0;
  let offCampusStarredCredits = 0;
  let onCampusCredits = 0;
  let offCampusCredits = 0;
  for (let course of schedule)
  {
    let credits = course.quarterCredits / 4;

    if (course.school === 'HM')
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
  
  const text = 'Scheduled credits: ' +
	onCampusCredits + ' on-campus credit' + (onCampusCredits !== 1 ? 's' : '') +
	' (' + onCampusStarredCredits + ' starred), ' +
	offCampusCredits + ' off-campus credit' + (offCampusCredits !== 1 ? 's' : '') +
	' (' + offCampusStarredCredits + ' starred), ' +
	totalCredits + ' total credit' + (totalCredits !== 1 ? 's' : '') +
	' (' + totalStarredCredits + ' starred)';
  creditCountText.textContent = text;
}

function displayCourseSearchColumn()
{
  this.blur();
  scheduleTabSelected = false;
  updateTabToggle();
  writeStateToLocalStorage();
}

function displayScheduleColumn()
{
  this.blur();
  scheduleTabSelected = true;
  updateTabToggle();
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

function catchEvent(event)
{
  event.stopPropagation();
}

function attachListeners()
{
  courseSearchToggle.addEventListener('click', displayCourseSearchColumn);
  scheduleToggle.addEventListener('click', displayScheduleColumn);
  courseSearchInput.addEventListener('keyup', updateCourseSearchResults);
  importExportDataButton.addEventListener('click', showImportExportModal);
  importExportSaveChangesButton.addEventListener(
    'click', saveImportExportModalChanges);
  sortable('.sortable-list', {
    forcePlaceholderSize: true,
    placeholder: createCourseEntity('placeholder').outerHTML,
  });
  printButton.addEventListener('click', () => {
    window.print()
  });
  selectedCoursesList.addEventListener('sortupdate', readSelectedCoursesList);
  window.addEventListener('resize', updateCourseDescriptionBoxHeight);
}

attachListeners();
readStateFromLocalStorage();
updateTabToggle();
updateSelectedCoursesList();
updateSchedule();
writeStateToLocalStorage();
retrieveCourseDataUntilSuccessful();
