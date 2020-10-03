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

export function generateDescription(s: Schedule, offset: number) {
  console.log(offset);
  // TODO timezone adjustments
  return (
    s.scheduleDays +
    " " +
    TimeString.tzAdjusted(s.scheduleStartTime, offset) +
    " – " +
    TimeString.tzAdjusted(s.scheduleEndTime, offset) +
    " at " +
    s.scheduleLocation
  );
}
