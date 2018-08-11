import React from 'react';
import {fromJS, Map, List, Set, Iterable} from 'immutable';

import randomColor from 'randomcolor';

export function deserializeCourse(data) {
  return fromJS(data);
}


const courseKeyFields = [
  'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section',
];
export function courseKey(course) {
  return (
    courseKeyFields
      .map(field => course.get(field))
      .join('/')
  );
}

const courseCodeKeyFields = [
  'department', 'courseNumber', 'courseCodeSuffix',
];
export function courseCodeKey(course) {
  return (
    courseCodeKeyFields
      .map(field => course.get(field))
      .join('/')
  );
}

const courseSortKeyFields = [
  'department',
  'courseNumber',
  'courseCodeSuffix',
  'school',
  'section',
];
export function courseSortKey(course) {
  return courseSortKeyFields.map(field => course.get(field));
}

export function courseSortCompare(courseA, courseB) {
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
  return commaJoin(course.get('faculty').toJS());
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

const courseColorSchoolHue = {
  HM: 'yellow',
  CM: 'red',
  SC: 'green',
  PO: 'blue',
  PZ: 'orange',
};
export function courseColor(course, format = 'hex') {
  return randomColor({
    hue: courseColorSchoolHue[course.get('school')] || 'monochrome',
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
            endA = timeToMinutes(parseTime(slotA.get('endTime'))),
            endB = timeToMinutes(parseTime(slotB.get('endTime')));
      
      if (startA <= startB && startB < endA ||
          startB <= startA && startA < endB) {
        return true;
      }
    }
  }

  return false;  
}

export function coursesRedundant(courseA, courseB) {
  return courseCodeKey(courseA) === courseCodeKey(courseB);
}

export const componentToJS = Component => props => {
  const jsProps = {};
  
  for (const key in props) {
    const value = props[key];
    
    if (Iterable.isIterable(value)) {
      jsProps[key] = value.toJS();
      continue;
    }

    jsProps[key] = value;
  }

  return <Component {...jsProps}/>;
};

export function serializeSelection(selection) {
  const courses = selection.get('courses');
  const order = selection.get('order');
  const starred = selection.get('starred');
  const checked = selection.get('checked');

  return order.map(key => courses.get(key).merge({
    starred: starred.has(key),
    selected: checked.has(key),
  }));
};

export function deserializeSelection(data) {
  let courses = Map();
  let order = List();
  let starred = Set();
  let checked = Set();

  for (const {
    starred: courseStarred,
    selected: courseChecked,
    ...courseData,
  } of data) {
    const course = deserializeCourse(courseData);
          
    const key = courseKey(course);
    courses = courses.set(key, fromJS(course));
    order = order.push(key);
    
      if (courseStarred) {
        starred = starred.add(key);
      }
      if (courseChecked) {
        checked = checked.add(key);
      }
  }

  return Map({
    courses, order, starred, checked,
  });
}

export function computeSchedule(selection) {
  const courses = selection.get('courses'),
        starred = selection.get('starred'),
        checked = selection.get('checked'),
        order = selection.get('order');

  let schedule = Set();

  for (const key of order) {
    if (checked.has(key) && starred.has(key)) {
      schedule = schedule.add(key);
    }
  }

  for (const key of order) {
    if (!checked.has(key)) {
      continue;
    }
    
    const course = courses.get(key);

    let conflict = false;
    for (const otherKey of schedule) {
      const other = courses.get(otherKey);
      
      if (coursesConflict(course, other) ||
          coursesRedundant(course, other)) {
        conflict = true;
        break;
      }
    }
    
    if (conflict) {
      continue;
    }

    schedule = schedule.add(key);
  }

  return schedule;
}

export function classMap(map) {
  const classes = [];
  for (const className in map) {
    if (map[className]) {
      classes.push(className);
    }
  }
  return classes.join(' ');
}

function commaJoin(items, comma = ',') {
  switch (true) {
  case items.length === 1:
    return items[0];
  case items.length === 2:
    return items.join(' and ');
  case items.length >= 3:
    return items.slice(0, -1).join(comma + ' ') + comma +' and ' + items[-1];
  default:
    return '';
  }
};

