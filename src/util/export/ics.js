import ical from "ical-generator";

import * as courseUtil from "@/util/course";
import * as util from "@/util/misc";

const dayToICal = {
  U: "SU",
  M: "MO",
  T: "TU",
  W: "WE",
  R: "TH",
  F: "FR",
  S: "SA",
};

export const exportICS = (courses, keys) => {
  const cal = ical();

  for (const key of keys) {
    const course = courses.get(key);
    for (const slot of course.get("schedule")) {
      const listedStartDay = new Date(course.get("startDate"));
      const listedStartWeekday = listedStartDay.getDay();
      const listedEndDay = new Date(course.get("endDate"));

      // Determine the first day of class. We want to pick the
      // weekday that occurs the soonest after (possibly on the same
      // day as) the listed start date.
      let weekdayDifference = 7;
      for (const weekday of slot.get("days")) {
        const possibleStartWeekday = util.dayIndex[weekday];
        const possibleWeekdayDifference =
          (possibleStartWeekday - listedStartWeekday) % 7;
        if (possibleWeekdayDifference < weekdayDifference) {
          weekdayDifference = possibleWeekdayDifference;
        }
      }

      const description =
        courseUtil.courseFullCode(course) +
        " " +
        course.get("courseName") +
        "\n" +
        courseUtil.courseFacultyString(course);

      const start = new Date(listedStartDay.valueOf());
      start.setDate(start.getDate() + weekdayDifference);
      const {
        hour: startHours,
        minute: startMinutes,
      } = courseUtil.parseTime(slot.get("startTime"));
      start.setHours(startHours);
      start.setMinutes(startMinutes);

      const end = new Date(start.valueOf());
      const {
        hour: endHours,
        minute: endMinutes,
      } = courseUtil.parseTime(slot.get("endTime"));
      end.setHours(endHours);
      end.setMinutes(endMinutes);

      cal.createEvent({
        summary: course.get("courseName"),
        description,
        location: course.get("location"),
        start,
        end,
        repeating: {
          freq: "WEEKLY",
          until: listedEndDay,
          interval: 1,
          byDay: Array.from(slot.get("days")).map(
            day => dayToICal[day],
          ),
        },
      });
    }
  }

  const value = cal.toString();

  const uri = "data:text/calendar;base64," + btoa(value);
  window.open(uri, "hyperschedule.ics");
};
