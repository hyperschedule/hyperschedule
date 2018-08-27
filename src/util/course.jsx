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
 *
 * Example: "HM/WRIT/1/A/2"
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
 * being included in the schedule.  Note that courses sharing the same
 * code among different schools are still considered different.
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
 *
 * Example: "HM/WRIT/1/A"
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
 * course data fields used to generate the course sort key.
 *
 * @returns {Array.<String>} The generated course sort key, an array
 * of course data fields used to lexicographically compare and sort
 * courses by their data fields.
 *
 * Example: ["WRIT", 1, "A", "HM", "2"]
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

/**
 * Compare two courses for sorting based on the course sort key,
 * returning a negative value if the first argument is to be ordered
 * before the second argument, a positive value if after, or zero if
 * either ordering is acceptable.
 *
 * @see {@link module:util/misc.sortKeyComparator} higher-order
 * comparator factory for more details on the comparator function.
 *
 * @see {@link courseSortKey} for the sort key used to compare
 * courses.
 */
export const coursesSortCompare = util.sortKeyComparator(
  courseSortKey,
);

/**
 * Generate user-facing course code string without school or section,
 * to be used in course display lists, course descriptions, etc. for a
 * course.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the course code string.
 *
 * @returns {String} Course code string to be displayed to the user.
 *
 * Example: "WRIT 001A"
 */
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

/**
 * Generate user-facing course "section" label, comprising the school
 * together with the section number.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the course section label.
 *
 * @returns {String} Course section label string to be displayed.
 *
 * Example: "HM-02"
 */
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

/**
 * Generate user-facing full course code, which assigns a fully unique
 * identifier to each course in a user-readable format, to be
 * displayed in course lists, descriptions, etc.  This code amounts to
 * a user-friendly analog to the key generated by courseKey.
 *
 * @see {@link courseKey} for the non-user-facing course identifier
 * used to uniquely identify course objects under the hood.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the full course code string.
 *
 * @returns {String} Full course code to be displayed.
 *
 * Example: "WRIT 001 HM-02"
 */
export function courseFullCode(course) {
  return courseCode(course) + " " + courseSection(course);
}

/**
 * Generate user-facing course status string, describing the total
 * number of seats available in the class, the number of occupied
 * seats (misleadingly named "openSeats" in the API spec), and the
 * open-status of the course.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * course data fields used to generate the course status string.
 *
 * @return {String} Generated user-facing course status string.
 *
 * Example: "open, 3/15 seats filled"
 */
export function courseStatusString(course) {
  return (
    `${course.get("courseStatus")}, ` +
    `${course.get("openSeats")}/${course.get(
      "totalSeats",
    )} seats filled`
  );
}

/**
 * Generate comma-delimited, "and"-joined, list of faculty members for
 * a given course.
 *
 * @see {@link module:util/misc.commaJoin} for the actual function
 * that joins a list of strings with commas and "and"s.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * a "faculty" field from which the faculty string is to be generated.
 *
 * @returns {String} The comma-delimited, "and"-joined list of faculty
 * member names.
 *
 * Example: "De Laet, Marianne and Lynn, Theresa"
 */
export function courseFacultyString(course) {
  return util.commaJoin(course.get("faculty").toJS());
}

/**
 * Returns the number of half-semesters occupied by a course.  This is
 * a convenience function used to in calculating the display width of
 * a course block in the schedule calendar display.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * "firstHalfSemester" and "secondHalfSemester" fields.
 *
 * @returns {Number} The number of half-semesters in the course.
 */
export function courseHalfSemesters(course) {
  return (
    course.get("firstHalfSemester") + course.get("secondHalfSemester")
  );
}

/**
 * Returns the number of credits for a course.  The API spec provides
 * a "quarterCredits" property (course credits as a multiple of 0.25
 * credits) to avoid dealing with non-integer values.  This
 * readability function converts the quarter-credit count to a
 * whole-credit count, to be used in course descriptions and schedule
 * credit counts.
 *
 * @param {Immutable.Map} course Immutable course object containing
 * the "quarterCredits" property from which the total number of
 * credits is to be derived.
 *
 * @returns {Number} The number of credits offered by the course.
 */
export function courseCredits(course) {
  return course.get("quarterCredits") / 4;
}

/**
 * Determine whether a course matches a given search query.
 *
 * The current search algorithm is a simple multi-part substring
 * match.  The search query string is first split into multiple
 * subqueries (delimited by whitespace); each subquery is then matched
 * against the course's full title (comprising the course code,
 * section, and name, e.g. "WRIT001 HM-02 Introduction to Academic
 * Writing"; note that the course code outputted by courseCode
 * contains a space between the department and course number,
 * e.g. "WRIT 001", but the course code used here omits that space to
 * allow queries like "WRIT001" to match the course), then each of the
 * course's faculty members.  A course matches a given subquery if the
 * subquery exists as a substring in the course's full title or as a
 * substring in any of the faculty's names.  A course matches a given
 * query if the course matches each of the query's subqueries.  All
 * matches are case-insensitive.
 *
 * @param {Immutable.Map} course Immutable course object used to match
 * against the given search query.
 *
 * @param {String} search The user's current search query string, stored in
 * the global Redux state under the key path ["search", "string"].
 *
 * @returns {Boolean} True if the course matches the search query;
 * false if not.
 */
export function courseMatches(course, search) {
  const queries = search.toLowerCase().split(/\s+/);

  const code = courseCode(course)
    .toLowerCase()
    .replace(/\s+/, "");
  const section = courseSection(course).toLowerCase();
  const name = course.get("courseName").toLowerCase();

  /**
   * Determine whether the course matches a single subquery.
   *
   * @param {String} subquery The subquery to match the course
   * against.  The subquery should not contain any whitespace.
   *
   * @returns {Boolean} True if the course matches the subquery; false
   * if not.
   */
  function matchesSubquery(subquery) {
    if (
      code.includes(subquery) ||
      section.includes(subquery) ||
      name.includes(subquery)
    ) {
      return true;
    }

    for (const instructor of course.get("faculty")) {
      if (instructor.toLowerCase().includes(subquery)) {
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

/**
 * Deterministically generate random background color for course
 * entities (course list items, course schedule blocks) using
 * randomColor.  For now, color generation is a simple unbiased random
 * color, seeded by the course's full course code.
 *
 * @see {@link courseFullCode} for the full course code used to seed
 * the random color generation.
 *
 * @param {Immutable.Map} course Immutable course object for which to
 * generate the random color.  The course data is used to seed the
 * random color generation.
 *
 * @returns {String} The generated color as a six-digit, "#"-prefixed
 * hex color code, to be directly used as a "backgroundColor" style
 * value for course entities.
 */
export function courseColor(course) {
  return randomColor({
    luminosity: "light",
    seed: courseFullCode(course),
    format: "hex",
  });
}

/**
 * Determine whether two day strings (found in a course's schedule
 * slot data object under the "days" key, where the schedule slot data
 * object refers to an item in the list stored under the course object
 * under the "schedule" key; e.g. "MWF") contain any overlapping days.
 * This is a simple set-intersection on the two strings, used to
 * determine whether two courses have conflicting schedule times.
 *
 * @param {String} daysA A day string, containing some subsequence of
 * "MTWRFSU", representing a subset of the seven days of the week.
 *
 * @param {String} daysB Another day string.
 *
 * @returns {Boolean} True if the both `daysA` and `daysB` contain
 * some same day; false if not.
 */
function daysOverlap(daysA, daysB) {
  const daysASet = new Set(daysA);
  for (const dayB of daysB) {
    if (daysASet.has(dayB)) {
      return true;
    }
  }
  return false;
}

/**
 * Parse a time string in "hh:mm" format into an object with "hour"
 * and "minute" fields to facilitate arithmetic and quick-maths.  This
 * is used to parse a course's schedule times to determine whether two
 * courses occurring on the same day have conflicting times.
 *
 * @param {String} timeString A string representing a 24-hour time,
 * precise to the minute, in "hh:mm" format.
 *
 * @returns {Object} An object with "hour" and "minute" fields, both
 * integers, representing the parsed hour and minute encoded in the
 * time string.  No validation is done to ensure that "hour" and
 * "minute" correspond to an actual, valid, 24-hour clock time.
 */
export function parseTime(timeString) {
  const [hourString, minuteString] = timeString.split(":");
  return {
    hour: parseInt(hourString),
    minute: parseInt(minuteString),
  };
}

/**
 * Convert a time object (with "hour" and "minute" fields) into a
 * single minutes count (the number of minutes since 00:00), used to
 * compare two different times.
 *
 * @param {Object} time A time object with "hour" and "minute" integer
 * fields, representing a 24-hour clock time.
 *
 * @returns {Number} An integer representing the duration, in minutes,
 * from 00:00 to the given time.
 */
export function timeToMinutes({hour, minute}) {
  return hour * 60 + minute;
}

/**
 * Determine whether two courses have conflicting schedule slots.  Two
 * courses conflict if any of their schedule slots conflict; two
 * schedule slots conflict if they have any overlapping days and have
 * overlapping times on those days.
 *
 * @see {@link daysOverlap} for the function that checks for
 * overlapping days.
 *
 * @see {@link parseTime} and {@link timeToMinutes} for logic used to
 * parse and compare times to determine overlaps.
 *
 * @param {Immutable.Map} courseA An immutable course object.
 *
 * @param {Immutable.Map} courseB Another course object, used to test
 * for schedule time conflicts against `courseA`.
 *
 * @returns {Boolean} True if the two courses conflict; false if not.
 */
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

/**
 * Determines whether two courses are equivalent, in the sense that
 * they represent the same course and merely differ in section.  Note
 * that two courses sharing the same code but differing in school are
 * still considered different, regardless of section.  This
 * equivalence is used to prevent the same course from being included
 * multiple times in the same schedule under different sections.
 *
 * @see {@link courseCodeKey} for the relevant course data fields used
 * to determine this equivalence.
 *
 * @param {Immutable.Map} courseA Immutable course object used to test
 * for equivalence against another course.
 *
 * @param {Immutable.Map} courseB Another course object used to test
 * for equivalence against `courseA`.
 *
 * @returns {Boolean} True if the courses are equivalent; false if
 * not.
 */
export function coursesEquivalent(courseA, courseB) {
  return courseCodeKey(courseA) === courseCodeKey(courseB);
}

/**
 * React propType for used for run-time type checking of Immutable
 * course data objects passed to React components as props.
 *
 * @see {@link https://reactjs.org/docs/typechecking-with-proptypes.html}.
 */
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
