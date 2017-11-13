const courseSearchInput = document.getElementById('input-search-course-name');
const courseSearchList = document.getElementById('list-search-courses');

let courseData = null;

// https://stackoverflow.com/a/2593661
function quoteRegexp(str)
{
  return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

function hideEntity(entity)
{
  entity.style.display = 'none';
}

function showEntity(entity)
{
  entity.style.display = 'block';
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
  const textNode = document.createTextNode(courseToString(course));
  listItem.appendChild(textNode);
  listItem.classList.add('course');
  return listItem;
}

function updateCourseSearchList()
{
  while (courseSearchList.hasChildNodes())
  {
    courseSearchList.removeChild(courseSearchList.lastChild);
  }
  for (let course of courseData.courses)
  {
    courseSearchList.appendChild(createCourseEntity(course));
  }
  updateCourseSearchResults();
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
  const entities = courseSearchList.children;
  for (let idx = 0; idx < courses.length; ++idx)
  {
    const course = courses[idx];
    const entity = entities[idx];
    const visible = courseMatchesSearchQuery(course, query);
    setEntityVisibility(entity, visible);
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
  setTimeout(updateCourseSearchList, 0);
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
}

attachListeners();
retrieveCourseDataUntilSuccessful();
