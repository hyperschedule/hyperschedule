import * as Util from "./util";

export function toHoursMinutes(ts: string): [number, number] {
  const h = parseInt(ts.substr(0, 2), 10);
  const m = parseInt(ts.substr(3, 2), 10);

  console.assert(
    0 <= h && h < 24 && 0 <= m && m < 60,
    `TimeString.toHoursMinutes: invalid time string ${JSON.stringify(ts)}`
  );

  return [h, m];
}

export function to12HoursMinutesPm(ts: string): [number, number, boolean] {
  const [h, m] = toHoursMinutes(ts);
  return [Util.mod(h - 1, 12) + 1, m, h >= 12];
}

export function toFractionalHours(ts: string) {
  const [h, m] = toHoursMinutes(ts);
  return h + m / 60;
}

function padZeroes2(n: number) {
  return n.toString().padStart(2, "0");
}

export function to12HourString(ts: string) {
  let [h, m, pm] = to12HoursMinutesPm(ts);
  return `${padZeroes2(h)}:${padZeroes2(m)} ${pm ? "PM" : "AM"}`;
}

export function tzDayOffset(ts: string, offset: number) {
  // this is a quick and dirty hack to account for next-day/prev-day shifts due
  // to time zones; TODO something better, such as using JS's built-in Date
  // object or Intl.
  return Math.floor((toFractionalHours(ts) + offset) / 24);
}

export function tzAdjusted(ts: string, offset: number) {
  // TODO: does not account for possible day shifts
  const [hUnadjusted, mUnadjusted] = toHoursMinutes(ts);
  const m = mUnadjusted + Util.mod(offset, 1) * 60;
  const h = Util.mod(hUnadjusted + Math.floor(offset) + Math.floor(m / 60), 24);
  const h12 = Util.mod(h - 1, 12) + 1;
  const pm = h >= 12;

  return `${h12.toString()}:${padZeroes2(Util.mod(m, 60))}${pm ? "pm" : "am"}`;
}
