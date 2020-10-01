import * as TimeString from "./time-string";

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

export function generateDescription(s: Schedule) {
  // TODO timezone adjustments
  return (
    s.scheduleDays +
    " " +
    TimeString.to12HourString(s.scheduleStartTime) +
    " – " +
    TimeString.to12HourString(s.scheduleEndTime) +
    " at " +
    s.scheduleLocation
  );
}
