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

export function toFractionalHours(timeString: string) {
  const [hours, minutes] = toHoursMinutes(timeString);
  return hours + minutes / 60;
}

function padZeroes2(n: number) {
  return n.toString().padStart(2, "0");
}

export function to12HourString(ts: string) {
  let [h, m, pm] = to12HoursMinutesPm(ts);
  return `${padZeroes2(h)}:${padZeroes2(m)} ${pm ? "PM" : "AM"}`;
}

export function tzAdjusted(ts: string, offset: number) {
  // TODO: does not account for possible day shifts
  const [hUnadjusted, mUnadjusted, pm] = to12HoursMinutesPm(ts);
  const frac = Util.mod(hUnadjusted + mUnadjusted / 60 + offset, 24);
  const h = Math.floor(frac);
  const m = Math.round(frac - h) * 60;

  return `${h.toString()}:${padZeroes2(m)}${pm ? "pm" : "am"}`;
}
