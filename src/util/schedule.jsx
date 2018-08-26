import {Set} from "immutable";
import * as courseUtil from "@/util/course";

export function computeSchedule(selection) {
  const courses = selection.get("courses"),
    starred = selection.get("starred"),
    checked = selection.get("checked"),
    order = selection.get("order");

  function scheduleCompatible(schedule, key) {
    const course = courses.get(key);

    for (const existingKey of schedule) {
      const other = courses.get(existingKey);

      if (
        courseUtil.coursesConflict(course, other) ||
        courseUtil.coursesEquivalent(course, other)
      ) {
        return false;
      }
    }

    return true;
  }

  const scheduleStarred = order.reduce(
    (schedule, key) =>
      checked.has(key) && starred.has(key)
        ? schedule.add(key)
        : schedule,
    Set(),
  );

  return order.reduce((schedule, key) => {
    if (!checked.has(key) || !scheduleCompatible(schedule, key)) {
      return schedule;
    }

    return schedule.add(key);
  }, scheduleStarred);
}
