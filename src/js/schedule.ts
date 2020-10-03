import * as TimeString from "./time-string";

const weekdays = "UMTWRFS";

export interface Schedule {
  scheduleStartTime: string;
  scheduleStartDate: string;
  scheduleEndDate: string;
  scheduleEndTime: string;
  scheduleTerms: number[];
  scheduleTermCount: number;
  scheduleLocation: string;
  scheduleDays: string;
}

export function generateDescription(s: Schedule, offset: number) {
  // TODO timezone adjustments

  // dirty hack for detecting whether we are on the next day;
  const d = TimeString.tzDayOffset(s.scheduleStartTime, offset);

  return (
    s.scheduleDays
      .split("")
      .map(c => weekdays.charAt((weekdays.indexOf(c) + d) % weekdays.length))
      .join("") +
    " " +
    TimeString.tzAdjusted(s.scheduleStartTime, offset) +
    " – " +
    TimeString.tzAdjusted(s.scheduleEndTime, offset) +
    " at " +
    s.scheduleLocation
  );
}
