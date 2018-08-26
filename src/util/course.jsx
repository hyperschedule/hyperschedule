import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes from "prop-types";
import randomColor from "randomcolor";
import {Set} from "immutable";

import * as util from "@/util/misc";

/**
 * Generate unique course key (to be used perhaps as a dictionary key)
 * from a course using the correct fields.
 *
 * @see {@link https://github.com/MuddCreates/hyperschedule-scraper}
 * for API details regarding unique course keys.
 *
 * @see {@link courseCodeKey} for a similar function that generates a
 * key but ignores the section, such that different sections of the
 * same course are assigned the same key.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the unique course key.
 *
 * @returns {String} The unique course key corresponding to the given
 * course.
 */
export function courseKey(course) {
  return [
    "school",
    "department",
    "courseNumber",
    "courseCodeSuffix",
    "section",
  ]
    .map(field => course.get(field))
    .join("/");
}

/**
 * Generate a course code key, which serves a unique identifier for a
 * group of courses sharing the same course code (i.e. school,
 * department, course number) and only differing in section.  This key
 * is used to check for course equivalences computing the schedule and
 * prevent different sections of the same course from concurrently
 * being included in the schedule.
 *
 * @see {@link courseKey} for a truly unique course identifier key
 * that accounts for different sections as different courses.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the course code key.
 *
 * @returns {String} The generated course code key, a unique
 * identifier for the course and all other sections sharing the same
 * course code.
 */
export function courseCodeKey(course) {
  return ["school", "department", "courseNumber", "courseCodeSuffix"]
    .map(field => course.get(field))
    .join("/");
}

/**
 * Generate a course sorting key, to be used for sorting the course
 * search list when courses are fetched from the API or loaded from
 * the localStorage cache.
 *
 * Note that this course sort "key" differs from courseKey and
 * courseCodeKey in that both courseKey and courseCodeKey return a
 * string of slash-joined course data fields, while the sort key
 * returned by this function is an array of course data fields, used
 * to lexicographically compare and sort courses by their data fields.
 *
 * @see {@link courseKey} and {@link courseCodeKey}.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the course code key.
 *
 * @returns {Array.<String>} The generated course sort key, an array
 * of course data fields used to lexicographically compare and sort
 * courses by their data fields.
 */
export function courseSortKey(course) {
  return [
    "department",
    "courseNumber",
    "courseCodeSuffix",
    "school",
    "section",
  ].map(field => course.get(field));
}

export const coursesSortCompare = util.sortKeyComparator(
  courseSortKey,
);

export function courseCode(course) {
  return (
    course.get("department") +
    " " +
    course
      .get("courseNumber")
      .toString()
      .padStart(3, "0") +
    course.get("courseCodeSuffix")
  );
}

export function courseSection(course) {
  return (
    course.get("school") +
    "-" +
    course
      .get("section")
      .toString()
      .padStart(2, "0")
  );
}

export function courseFullCode(course) {
  return courseCode(course) + " " + courseSection(course);
}

export function courseStatusString(course) {
  return (
    `${course.get("courseStatus")}, ` +
    `${course.get("openSeats")}/${course.get(
      "totalSeats",
    )} seats filled`
  );
}

export function courseFacultyString(course) {
  return util.commaJoin(course.get("faculty").toJS());
}

export function courseHalfSemesters(course) {
  return (
    course.get("firstHalfSemester") + course.get("secondHalfSemester")
  );
}

export function courseCredits(course) {
  return course.get("quarterCredits") / 4;
}

export function courseMatches(course, search) {
  const queries = search.toLowerCase().split(/\s+/);

  const code = courseCode(course)
    .toLowerCase()
    .replace(/\s+/, "");
  const section = courseSection(course).toLowerCase();
  const name = course.get("courseName").toLowerCase();

  function matchesSubquery(subquery) {
    if (
      code.includes(subquery) ||
      section.includes(subquery) ||
      name.includes(subquery)
    ) {
      return true;
    }

    for (const instructor of course.get("faculty")) {
      if (instructor.includes(subquery)) {
        return true;
      }
    }

    return false;
  }

  for (const subquery of queries) {
    if (!matchesSubquery(subquery)) {
      return false;
    }
  }

  return true;
}

export function courseColor(course, format = "hex") {
  return randomColor({
    luminosity: "light",
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
  const [hourString, minuteString] = timeString.split(":");
  return {
    hour: parseInt(hourString),
    minute: parseInt(minuteString),
  };
}

export function timeToMinutes({hour, minute}) {
  return hour * 60 + minute;
}

export function coursesConflict(courseA, courseB) {
  if (
    !(
      (courseA.get("firstHalfSemester") &&
        courseB.get("firstHalfSemester")) ||
      (courseA.get("secondHalfSemester") &&
        courseB.get("secondHalfSemester"))
    )
  ) {
    return false;
  }

  for (const slotA of courseA.get("schedule")) {
    for (const slotB of courseB.get("schedule")) {
      if (!daysOverlap(slotA.get("days"), slotB.get("days"))) {
        continue;
      }

      const startA = timeToMinutes(parseTime(slotA.get("startTime"))),
        startB = timeToMinutes(parseTime(slotB.get("startTime"))),
        endA = timeToMinutes(parseTime(slotA.get("endTime"))),
        endB = timeToMinutes(parseTime(slotB.get("endTime")));

      if (
        (startA <= startB && startB < endA) ||
        (startB <= startA && startA < endB)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function coursesEquivalent(courseA, courseB) {
  return courseCodeKey(courseA) === courseCodeKey(courseB);
}

export const coursePropType = ImmutablePropTypes.mapContains({
  courseCodeSuffix: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
  courseNumber: PropTypes.number.isRequired,
  courseStatus: PropTypes.string.isRequired,
  department: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  faculty: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
  firstHalfSemester: PropTypes.bool.isRequired,
  openSeats: PropTypes.number.isRequired,
  quarterCredits: PropTypes.number.isRequired,
  schedule: ImmutablePropTypes.listOf(
    ImmutablePropTypes.mapContains({
      days: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    }),
  ).isRequired,
  school: PropTypes.string.isRequired,
  secondHalfSemester: PropTypes.bool.isRequired,
  section: PropTypes.number.isRequired,
  startDate: PropTypes.string.isRequired,
  totalSeats: PropTypes.number.isRequired,
});
