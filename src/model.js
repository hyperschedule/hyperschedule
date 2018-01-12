import React from 'react';

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

export function coursesMutuallyExclusive(course1, course2)
{
  return (course1.department === course2.department &&
          course1.courseNumber === course2.courseNumber &&
          course1.courseCodeSuffix === course2.courseCodeSuffix);
}

export function coursesConflict(course1, course2)
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

export function computeSchedule(courses)
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

function courseCodeToString(course)
{
  return course.department + ' ' +
    course.courseNumber.toString().padStart(3, '0') +
    course.courseCodeSuffix + ' ' +
    course.school + '-' +
    course.section.toString().padStart(2, '0');
}

export function createSlotEntity(course, day, startTime, endTime)
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

  const wrapper = (
    <div style={{top: `${verticalOffsetPercentage}%`,
                 left: `${horizontalOffsetPercentage}%`,
                 width: `${widthPercentage}%`,
         height: `${heightPercentage}%`}}
         className='schedule-slot-wrapper'>
      <div className='schedule-slot'>
        <p className='schedule-slot-text-wrapper'>
          <p className='schedule-slot-course-code'>
            {courseCodeToString(course)}
          </p>
          <p className='schedule-slot-course-name'>
            {course.courseName + ' (' + course.openSeats + '/' + course.totalSeats + ')'}
          </p>
        </p>
      </div>
    </div>
  );

  return wrapper;
}
