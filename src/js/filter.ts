import * as Course from "./course";

export const filterKeywords: Record<string, string[]> = {
  "dept:": ["dept:", "department:"],
  "college:": ["college", "col:", "school:", "sch:"],
  "days:": ["days:", "day:"]
};

export const filterInequalities = ["<=", ">=", "<", ">", "="];

// Search querying
export function courseMatchesSearchQuery(
  course: Course.CourseV3,
  query: RegExp[]
) {
  for (let subquery of query) {
    if (
      course.courseCode.match(subquery) ||
      course.courseCode.replace(/ /g, "").match(subquery) ||
      course.courseName.match(subquery)
    ) {
      continue;
    }
    let foundMatch = false;
    if (course.courseInstructors !== null) {
      for (let instructor of course.courseInstructors) {
        if (instructor.match(subquery)) {
          foundMatch = true;
          break;
        }
      }
    }
    if (foundMatch) {
      continue;
    }
    return false;
  }
  return true;
}

export function getSearchQuery(searchTextArray: string[]) {
  return searchTextArray.map((subquery: string) => {
    return new RegExp(quoteRegexp(subquery), "i");
  });
}

// https://stackoverflow.com/a/2593661
function quoteRegexp(str: string) {
  return (str + "").replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}

// General filtering
export function coursePassesTextFilters(
  course: Course.CourseV3,
  textFilters: Record<string, string>
) {
  const lowerCourseCode = course.courseCode.toLowerCase();
  const dept = lowerCourseCode.split(" ")[0];
  const col = lowerCourseCode.split(" ")[2].split("-")[0];

  if (
    (textFilters["dept:"] && !dept.match(textFilters["dept:"])) ||
    (textFilters["college:"] && !col.match(textFilters["college:"])) ||
    (textFilters["days:"] &&
      !coursePassesDayFilter(course, textFilters["days:"]))
  ) {
    return false;
  }

  return true;
}

export function getSearchTextFilters(filtersTextArray: string[]) {
  let filter: Record<string, string> = {};
  for (let text of filtersTextArray) {
    let keyword = text.split(":")[0] + ":";
    const filterText = text.split(":")[1];
    if (!(keyword in Object.keys(filterKeywords))) {
      for (let key of Object.keys(filterKeywords)) {
        if (filterKeywords[key].includes(keyword)) {
          keyword = key;
          break;
        }
      }
    }
    filter[keyword] = filterText;
  }
  return filter;
}

function parseInequality(input: string) {
  for (const rel of filterInequalities) if (input.startsWith(rel)) return rel;
  return "";
}

// Day filtering
export function coursePassesDayFilter(
  course: Course.CourseV3,
  inputString: string
) {
  const courseDays = generateDayFilter(course);
  const rel = parseInequality(inputString);
  const inputDays = generateInputDays(
    inputString.substring(rel.length).toLowerCase()
  );

  switch (rel) {
    case "<=":
      // courseDays is a subset of inputDays
      return setSubset(courseDays, inputDays);
    case "":
    case ">=":
      // inputDays is a subset of courseDays
      return setSubset(inputDays, courseDays);
    case "=":
      // inputDays match exactly courseDays
      const difference1 = new Set(
        [...courseDays].filter(x => !inputDays.has(x))
      );
      const difference2 = new Set(
        [...inputDays].filter(x => !courseDays.has(x))
      );
      return difference1.size == 0 && difference2.size == 0;
    case "<":
      // courseDays is a proper subset of inputDays
      return (
        setSubset(courseDays, inputDays) && inputDays.size != courseDays.size
      );
    case ">":
      // inputDays is a proper subset of courseDays
      return (
        setSubset(inputDays, courseDays) && inputDays.size != courseDays.size
      );
    default:
      return false;
  }
}

function generateDayFilter(course: Course.CourseV3) {
  const scheduleList = course.courseSchedule;
  let days = new Set();

  for (let schedule of scheduleList) {
    const str1 = schedule.scheduleDays.toLowerCase();
    const arr1 = [...str1];
    arr1.forEach(days.add, days);
  }
  return days;
}

function generateInputDays(input: string) {
  let days = new Set();
  const arr1 = [...input];
  arr1.forEach(days.add, days);
  return days;
}

function setSubset<T>(a: Set<T>, b: Set<T>) {
  if (a.size > b.size) return false;
  for (const elem of a) if (!b.has(elem)) return false;
  return true;
}

// Time filtering
// timeFilters is a one or two element array
// [start_time] or [start_time, end_time]
export function coursePassesTimeFilters(
  course: Course.CourseV3,
  timeFilters: [string] | [string, string]
) {
  // indicates no current time filters
  if (timeFilters[0] === "") {
    return true;
  }

  // if multiple start times, specified start must match at least one
  if (timeFilters.length === 1) {
    for (const schedule of course.courseSchedule) {
      if (timeFilters[0] === schedule.scheduleStartTime) {
        return true;
      }
    }
    return false;
  } else {
    // if multiple start times, specified range must match all
    const startMins = timeToMinutes(timeFilters[0]);
    const endMins = timeToMinutes(timeFilters[1]);

    for (const schedule of course.courseSchedule) {
      const schedStartMins = timeToMinutes(schedule.scheduleStartTime);
      const schedEndMins = timeToMinutes(schedule.scheduleEndTime);
      if (
        // returns false if any schedule object is not within the range.
        !(startMins <= schedStartMins && endMins >= schedEndMins)
      ) {
        return false;
      }
    }
    return true;
  }
}

// Returns an array containing either the start time
// and end time or the start time alone
export function getTimeFilter(timeText: string): [string] | [string, string] {
  timeText = timeText.toLowerCase();
  let inputArr = timeText.split("-");
  // Single time value (ex: 1:00 PM)
  if (inputArr.length === 1) {
    const rel = parseInequality(timeText);
    inputArr = getTimeRange(rel, timeText.substring(rel.length));
  }
  let timeArr = [];
  for (let time of inputArr) {
    let [hour, min] = time.split(":");
    const sufPresent = /[ap][m]$/.test(time);
    // Must remove am/pm
    if (sufPresent) {
      const suf = time.substring(time.length - 2);
      min = min.substring(0, min.length - 2);
      time = `${hour}:${min}`;

      if (suf === "am" && time.startsWith("12")) {
        time = "00:".concat(min);
      } else if (suf === "pm" && !time.startsWith("12")) {
        const hourNum = parseInt(hour, 10) + 12;
        time = hourNum.toString().concat(":" + min);
      }
    } else {
      if (time.startsWith("12")) {
        time = "00:".concat(min);
      }
    }
    timeArr.push(time);
  }
  return timeArr as [string] | [string, string];
}

export function isTimeRange(searchText: string) {
  const timeArray = searchText.split("-");
  // Time can be singular or a range (ex: 3:00PM or 3:00PM-4:00PM)
  // Using 24 hr time regex
  return timeArray.every(time =>
    /^([01]?[0-9]|2[0-3]):([0-5][0-9]$)|([ap][m]$)/.test(time)
  );
}

function getTimeRange(rel: string, timeText: string) {
  let newTimeFilter = [];
  switch (rel) {
    case ">":
    case ">=":
      newTimeFilter.push(timeText);
      newTimeFilter.push("23:59");
      break;
    case "=":
      newTimeFilter.push(timeText);
      break;
    case "<=":
    case "<":
      newTimeFilter.push("00:00");
      newTimeFilter.push(timeText);
      break;
    default:
      newTimeFilter.push(timeText);
  }
  return newTimeFilter;
}

function timeToMinutes(time: string): number {
  const [hour, mins] = time.split(":");
  return parseInt(hour, 10) * 60 + parseInt(mins, 10);
}
