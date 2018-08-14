import React from 'react';
import {fromJS, Map, List, Set, Iterable} from 'immutable';

import * as util from '@/util/misc';

import randomColor from 'randomcolor';

const keyFields = [
  'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section',
];

export function courseKey(course) {
  return (
    keyFields
      .map(field => course.get(field))
      .join('/')
  );
}

const codeKeyFields = [
  'department', 'courseNumber', 'courseCodeSuffix',
];

export function courseCodeKey(course) {
  return (
    codeKeyFields
      .map(field => course.get(field))
      .join('/')
  );
}

const sortKeyFields = [
  'department',
  'courseNumber',
  'courseCodeSuffix',
  'school',
  'section',
];

export function courseSortKey(course) {
  return sortKeyFields.map(field => course.get(field));
}

export function coursesSortCompare(courseA, courseB) {
  const sortA = courseSortKey(courseA),
        sortB = courseSortKey(courseB);

  return sortA < sortB ? -1 : sortA > sortB ? 1 : 0;
}

export function courseCode(course) {
  return course.get('department') + ' ' +
    course.get('courseNumber').toString().padStart(3, '0') +
    course.get('courseCodeSuffix');
}

export function courseFullCode(course) {
  return courseCode(course) + ' ' +
    course.get('school') + '-' +
    course.get('section').toString().padStart(2, '0');
}

export function courseStatusString(course) {
  return `${course.get('courseStatus')}, ` +
    `${course.get('openSeats')}/${course.get('totalSeats')} seats filled`;
}

export function courseFacultyString(course) {
  return util.commaJoin(course.get('faculty').toJS());
}

export function courseHalfSemesters(course) {
  return course.get('firstHalfSemester') + course.get('secondHalfSemester');
}

export function courseCredits(course) {
  return course.get('quarterCredits') / 4;
}

export function courseMatches(course, search) {
  return course.get('courseName').toLowerCase().includes(
    search.toLowerCase(),
  );
}

const colorSchoolHue = {
  HM: 'yellow',
  CM: 'red',
  SC: 'green',
  PO: 'blue',
  PZ: 'orange',
};

export function courseColor(course, format = 'hex') {
  return randomColor({
    luminosity: 'light',
    seed: courseFullCode(course),
    format,
  });
}

function daysOverlap(daysA, daysB) {
  const daysASet = new Set(daysA);
  for (const dayB of daysB) {
    if (daysASet.has(dayB)) {
      return true;
    }
  }
  return false;
}

export function parseTime(timeString) {
  const [hourString, minuteString] = timeString.split(':');
  return {
    hour: parseInt(hourString),
    minute: parseInt(minuteString),
  };
}

export function timeToMinutes({hour, minute}) {
  return hour * 60 + minute;
}

export function coursesConflict(courseA, courseB) {
  if (!(courseA.get('firstHalfSemester') && courseB.get('firstHalfSemester') ||
        courseA.get('secondHalfSemester') && courseB.get('secondHalfSemester'))) {
    return false;
  }

  for (const slotA of courseA.get('schedule')) {
    for (const slotB of courseB.get('schedule')) {
      if (!daysOverlap(slotA.get('days'), slotB.get('days'))) {
        continue;
      }

      const startA = timeToMinutes(parseTime(slotA.get('startTime'))),
            startB = timeToMinutes(parseTime(slotB.get('startTime'))),
            endA   = timeToMinutes(parseTime(slotA.get('endTime'))),
            endB   = timeToMinutes(parseTime(slotB.get('endTime')));

      if (startA <= startB && startB < endA ||
          startB <= startA && startA < endB) {
        return true;
      }
    }
  }

  return false;
}

export function coursesEquivalent(courseA, courseB) {
  return courseCodeKey(courseA) === courseCodeKey(courseB);
}
