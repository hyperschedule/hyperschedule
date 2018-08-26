import {Set} from "immutable";
import * as courseUtil from "@/util/course";

/**
 * Compute the user's schedule based on the user's selected courses.
 *
 * @param {Immutable.Map} selection The current Immutable selection
 * state, stored in the global Redux state under the "selection" key.
 *
 * @returns {Immutable.Set} An Immutable set containing the course
 * keys corresponding to courses to be included in the schedule.
 * @see {@link module:util/course.courseKey} for course key details.
 */
export function computeSchedule(selection) {
  const courses = selection.get("courses"),
    starred = selection.get("starred"),
    checked = selection.get("checked"),
    order = selection.get("order");

  /**
   * Determine whether a given course can/should be added to a
   * partially computed schedule without introducing conflicts or
   * redundant equivalent courses.
   *
   * @param {Immutable.Set} schedule The partially computed schedule,
   * an Immutable set containing course keys corresponding to some
   * courses that have been selected in the schedule to far.
   *
   * @param {String} key The course key corresponding to the course
   * candidate to be checked for conflicts/redundancies with the
   * schedule and added to the schedule.
   *
   * @returns {Boolean} True if the course can/should be added to the
   * schedule without introducing conflicts or redundancies; false if
   * not.
   */
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
