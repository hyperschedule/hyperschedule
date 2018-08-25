import {Set} from 'immutable';
import * as courseUtil from '@/util/course';

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

    let conflictFound = false;
    for (const otherKey of schedule) {
      const other = courses.get(otherKey);

      if (
        courseUtil.coursesConflict(course, other) ||
        courseUtil.coursesEquivalent(course, other)
      ) {
        conflictFound = true;
        break;
      }
    }

    if (conflictFound) {
      continue;
    }

    schedule = schedule.add(key);
  }

  return schedule;
}
