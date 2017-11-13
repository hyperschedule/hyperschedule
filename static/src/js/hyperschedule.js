const courseSearchInput = document.getElementById('course-search-course-name-input');
const courseSearchResultsList = document.getElementById('course-search-results-list');
const selectedCoursesList = document.getElementById('selected-courses-list');

let courseData = null;
let selectedCourses = [];

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

function createCourseEntity(course)
{
  const listItem = document.createElement('li');
  listItem.classList.add('course-box');

  const listItemContent = document.createElement('div');
  listItemContent.classList.add('course-box-content');
  listItem.appendChild(listItemContent);

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
  for (let course of selectedCourses)
  {
    selectedCoursesList.appendChild(createCourseEntity(course));
  }
  updateSortableLists();
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
}

function removeCourse(course)
{
  selectedCourses = selectedCourses.filter(selectedCourse => {
    return !coursesEquivalent(course, selectedCourse);
  });
  updateSelectedCoursesList();
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

function attachListeners()
{
  courseSearchInput.addEventListener('keyup', updateCourseSearchResults);
  sortable('.sortable-list', {
    forcePlaceholderSize: true,
    placeholder: createCourseEntity('placeholder').outerHTML,
  });
}

attachListeners();
retrieveCourseDataUntilSuccessful();
