import * as SortKey from "./sort-key";
import * as Schedule from "./schedule";
import * as Util from "./util";
import * as TimeString from "./time-string";
import * as Math from "mathjs";
import randomColor from "randomcolor";
import CryptoJs from "crypto-js";
import * as Redom from "redom";

interface Slot {
  days: string;
  location: string;
  startTime: string;
  endTime: string;
}

interface CourseEntityAttrs {
  alreadyAdded?: boolean;
  idx?: number;
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

export function createEntity(
  course: CourseV3 | "placeholder",
  actions = {
    add: (c: CourseV3) => {},
    remove: (c: CourseV3) => {},
    toggleStarred: (c: CourseV3) => {},
    toggleSelected: (c: CourseV3) => {},
    focus: (c: CourseV3) => {}
  },
  attrs?: CourseEntityAttrs
) {
  attrs = attrs || {};
  const alreadyAdded = attrs.alreadyAdded;

  const listItem = Redom.el(
    "div.course-box",
    Redom.el(
      "div.course-box-content",
      [
        Redom.el(
          "label.course-box-select-label",
          [
            Redom.el(
              "input.course-box-button.course-box-toggle.course-box-select-toggle",
              {
                type: "checkbox",
                checked: course !== "placeholder" && course.selected,
                onchange: () => {
                  if (course !== "placeholder") actions.toggleSelected(course);
                },
                onclick: Util.catchEvent
              }
            ),
            Redom.el("i.course-box-select-icon.icon", {
              class:
                "ion-android-checkbox" +
                (course !== "placeholder" && course.selected
                  ? ""
                  : "-outline-blank")
            })
          ],
          {
            onclick: Util.catchEvent
          }
        ),
        Redom.el(
          "label.course-box-star-label.star-visible",
          [
            Redom.el(
              "input.course-box-button.course-box-toggle.course-box-star-toggle",
              {
                type: "checkbox",
                onchange: () => {
                  if (course !== "placeholder") actions.toggleStarred(course);
                },
                onclick: Util.catchEvent
              }
            ),
            Redom.el("i.course-box-star-icon.icon", {
              class:
                "ion-android-star" +
                (course !== "placeholder" && course.starred ? "" : "-outline")
            })
          ],
          {
            onclick: Util.catchEvent
          }
        ),
        Redom.el("p.course-box-text", [
          Redom.el(
            "span.course-box-course-code",
            course === "placeholder" ? "placeholder" : course.courseCode
          ),
          course === "placeholder" ? "placeholder" : toString(course)
        ]),
        !attrs.alreadyAdded &&
          Redom.el(
            // TODO hide if already added
            "i.course-box-button.course-box-add-button.icon.ion-plus",
            {
              onclick: (e: MouseEvent) => {
                e.stopPropagation();
                console.log(
                  "add button clicked",
                  course !== "placeholder",
                  course
                );
                if (course !== "placeholder") actions.add(course);
              }
            }
          ),
        Redom.el(
          "i.course-box-button.course-box-remove-button.icon.ion-close",
          {
            onclick: (e: MouseEvent) => {
              e.stopPropagation();
              if (course !== "placeholder") actions.remove(course);
            }
          }
        )
      ],
      {
        style: {
          backgroundColor:
            course !== "placeholder" ? getColor(course) : "transparent"
        },
        onclick: () => {
          if (course !== "placeholder") actions.focus(course);
        }
      }
    ),
    {
      class: course === "placeholder" ? "placeholder" : "",
      dataset:
        attrs.idx !== undefined ? { courseIndex: attrs.idx.toString() } : {}
    }
  );

  return listItem;
}

export function mutuallyExclusive(a: CourseV3, b: CourseV3) {
  return SortKey.equal(a.courseMutualExclusionKey, b.courseMutualExclusionKey);
}

export function conflict(course1: CourseV3, course2: CourseV3) {
  for (let slot1 of course1.courseSchedule) {
    for (let slot2 of course2.courseSchedule) {
      const parts = Math.lcm(slot1.scheduleTermCount, slot2.scheduleTermCount);
      if (
        !(() => {
          for (let i = 0; i < parts; ++i)
            if (
              slot1.scheduleTerms.indexOf(i / slot2.scheduleTermCount) != -1 &&
              slot2.scheduleTerms.indexOf(i / slot1.scheduleTermCount) != -1
            )
              return true;
          return false;
        })()
      ) {
        return false;
      }
      let daysOverlap = false;
      for (let day1 of slot1.scheduleDays) {
        if (slot2.scheduleDays.indexOf(day1) !== -1) {
          daysOverlap = true;
          break;
        }
      }
      if (!daysOverlap) continue;
      const start1 = TimeString.toFractionalHours(slot1.scheduleStartTime);
      const end1 = TimeString.toFractionalHours(slot1.scheduleEndTime);
      const start2 = TimeString.toFractionalHours(slot2.scheduleStartTime);
      const end2 = TimeString.toFractionalHours(slot2.scheduleEndTime);
      if (start2 < end1 && start1 < end2) return true;
    }
  }
  return false;
}

export function getColor(
  course: CourseV3,
  format:
    | "hex"
    | "hsvArray"
    | "hslArray"
    | "hsl"
    | "hsla"
    | "rgbArray"
    | "rgb"
    | "rgba" = "hex"
) {
  let hue = "random";
  let seed = CryptoJs.MD5(course.courseCode).toString();

  // TODO
  //if (course.starred || !courseInSchedule(course)) {
  //  switch (gGreyConflictCourses) {
  //    case greyConflictCoursesOptions[0]:
  //      break;

  //    case greyConflictCoursesOptions[1]:
  //      if (courseConflictWithSchedule(course, true)) {
  //        hue = "monochrome";
  //        seed = "-10";
  //      }
  //      break;

  //    case greyConflictCoursesOptions[2]:
  //      if (courseConflictWithSchedule(course, false)) {
  //        hue = "monochrome";
  //        seed = "-10";
  //      }
  //      break;
  //  }
  //}

  return getRandomColor(hue, seed, format);
}

function getRandomColor(
  hue: string,
  seed: string,
  format:
    | "hex"
    | "hsvArray"
    | "hslArray"
    | "hsl"
    | "hsla"
    | "rgbArray"
    | "rgb"
    | "rgba" = "hex"
) {
  return randomColor({
    hue: hue,
    luminosity: "light",
    seed: seed,
    format
  });
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

export function generateDescription(course: CourseV3, offset: number) {
  const description = [[course.courseCode + " " + course.courseName]].flat(1);

  const times = course.courseSchedule.map(s =>
    Schedule.generateDescription(s, offset)
  );
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

export function createSlotEntities(
  course: CourseV3,
  focus = (c: CourseV3) => {}
) {
  const entities = [];
  for (const slot of course.courseSchedule) {
    const startTime = TimeString.toFractionalHours(slot.scheduleStartTime);
    const endTime = TimeString.toFractionalHours(slot.scheduleEndTime);
    const timeSince7am = startTime - TimeString.toFractionalHours("07:00");
    const duration = endTime - startTime;
    const text = course.courseName;
    const verticalOffsetPercentage = ((timeSince7am + 1) / 16) * 100;
    const heightPercentage = (duration / 16) * 100;
    for (const day of slot.scheduleDays) {
      const dayIndex = "MTWRF".indexOf(day);
      if (dayIndex === -1) {
        continue;
      }

      const wrapper = Redom.el(
        "div.schedule-slot-wrapper",
        {
          style: {
            gridColumnStart: Math.round(dayIndex + 2),
            gridRowStart: Math.round(timeSince7am * 12 + 2),
            gridRowEnd: "span " + Math.round(duration * 12),
            gridTemplateColumns: "repeat(" + slot.scheduleTermCount + ", 1fr)"
          },
          onclick: () => focus(course)
        },
        Util.getConsecutiveRanges(slot.scheduleTerms).map(
          ([left, right]: [number, number]) =>
            Redom.el(
              "div",
              {
                class:
                  "schedule-slot" +
                  (course.starred ? " schedule-slot-starred" : ""),
                style: {
                  gridColumnStart: left + 1,
                  gridColumnEnd: right + 1,
                  backgroundColor: getColor(course)
                }
              },
              [
                Redom.el("p.schedule-slot-text-wrapper", [
                  Redom.el("p.schedule-slot-course-code", course.courseCode),
                  Redom.el(
                    "p.schedule-slot-course-name",
                    course.courseName +
                      " (" +
                      course.courseSeatsFilled +
                      "/" +
                      course.courseSeatsTotal +
                      ")"
                  )
                ])
              ]
            )
        )
      );

      entities.push(wrapper);
    }
  }
  return entities;
}

export function isClosed(c: CourseV3) {
  return c.courseEnrollmentStatus === "closed";
}

export function toString(c: CourseV3) {
  return `${c.courseName} (${c.courseEnrollmentStatus}, ${c.courseSeatsFilled}/${c.courseSeatsTotal} seats filled)`;
}

export function toInstructorLastNames(c: CourseV3) {
  return (c.courseInstructors || []).map(s => s.split(",")[0]).join(",");
}

export function equal(a: CourseV3, b: CourseV3) {
  return a.courseCode === b.courseCode;
}
