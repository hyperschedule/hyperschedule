import * as SortKey from "./sort-key";
import * as Schedule from "./schedule";
import * as Util from "./util";

interface Slot {
  days: string;
  location: string;
  startTime: string;
  endTime: string;
}

export interface CourseV2 {
  starred: boolean;
  selected: boolean;
  school: string;
  section: string;
  courseNumber: string;
  department: string;
  totalSeats: number;
  openSeats: number;
  courseCodeSuffix: string;
  schedule: Slot[];
  firstHalfSemester: boolean;
  secondHalfSemester: boolean;
  startDate: string;
  endDate: string;
  courseName: string;
  faculty: string[];
  courseStatus: string;
  courseDescription: string;
  quarterCredits: number;
}

export interface CourseV3 {
  courseCode: string;
  courseName: string;
  courseSortKey: SortKey.SortKey;
  courseMutualExclusionKey: SortKey.SortKey;
  courseDescription: string | null;
  courseInstructors: string[] | null;
  courseTerm: string;
  courseSchedule: Schedule.Schedule[];
  courseCredits: string;
  courseSeatsTotal: number | null;
  courseSeatsFilled: number | null;
  courseWaitlistLength: number | null;
  courseEnrollmentStatus: string | null;
  starred: boolean;
  selected: boolean;
}

export function mutuallyExclusive(a: CourseV3, b: CourseV3) {
  return SortKey.equal(a.courseMutualExclusionKey, b.courseMutualExclusionKey);
}

function v2ToString(c: CourseV2) {
  return [
    c.department,
    c.courseNumber.toString().padStart(3, "0") + c.courseCodeSuffix,
    `${c.school}-${c.section.toString().padStart(2, "0")}`
  ].join(" ");
}

function courseIsV3(c: CourseV2 | CourseV3): c is CourseV3 {
  return !c.hasOwnProperty("quarterCredits");
}

export function upgrade(c: CourseV2 | CourseV3): CourseV3 {
  if (courseIsV3(c)) return c;
  return {
    courseCode: v2ToString(c),
    courseCredits: (c.quarterCredits / 4).toString(),
    courseDescription: c.courseDescription,
    courseEnrollmentStatus: c.courseStatus,
    courseInstructors: c.faculty,
    courseMutualExclusionKey: [
      c.department,
      c.courseNumber,
      c.courseCodeSuffix,
      c.school
    ],
    courseName: c.courseName,
    courseSchedule: c.schedule.map((slot: Slot) => {
      return {
        scheduleDays: slot.days,
        scheduleEndDate: c.endDate,
        scheduleEndTime: slot.endTime,
        scheduleLocation: slot.location,
        scheduleStartDate: c.startDate,
        scheduleStartTime: slot.startTime,
        scheduleTermCount: c.firstHalfSemester && c.secondHalfSemester ? 1 : 2,
        scheduleTerms: !c.firstHalfSemester ? [1] : [0]
      };
    }),
    courseSeatsFilled: c.openSeats,
    courseSeatsTotal: c.totalSeats,
    courseSortKey: [
      c.department,
      c.courseNumber,
      c.courseCodeSuffix,
      c.school,
      c.section
    ],
    courseTerm: "Unknown",
    courseWaitlistLength: null,
    selected: c.selected,
    starred: c.starred
  };
}
function termListDescription(terms: number[], termCount: number) {
  if (termCount > 10) {
    return "Complicated schedule";
  }

  if (termCount === 1) {
    return "Full-semester course";
  }

  const numbers = terms.map(Util.digitToStringOrdinal);

  const qualifier = Util.digitToStringFractional(termCount);

  return Util.capitalize(
    `${Util.formatList(numbers)} ${qualifier}-semester course`
  );
}

export function generateDescription(course: CourseV3) {
  const description = [[course.courseCode + " " + course.courseName]].flat(1);

  const times = course.courseSchedule.map(Schedule.generateDescription);
  for (const time of times) {
    description.push(time);
  }

  const instructors = Util.formatList(course.courseInstructors || []);
  description.push(instructors);

  let partOfYear;
  if (course.courseSchedule.length === 0) {
    partOfYear = "No scheduled meetings";
  } else {
    const meeting = course.courseSchedule[0];
    partOfYear = termListDescription(
      meeting.scheduleTerms,
      meeting.scheduleTermCount
    );
  }
  const credits = parseFloat(course.courseCredits);
  const creditsString = credits + " credit" + (credits !== 1 ? "s" : "");
  description.push(`${partOfYear}, ${creditsString}`);

  if (course.courseDescription !== null) {
    description.push(course.courseDescription);
  }

  if (course.courseEnrollmentStatus !== null) {
    const enrollment =
      course.courseEnrollmentStatus.charAt(0).toUpperCase() +
      course.courseEnrollmentStatus.slice(1) +
      ", " +
      course.courseSeatsFilled +
      "/" +
      course.courseSeatsTotal +
      " seats filled";
    description.push(enrollment);
  }

  return description;
}
