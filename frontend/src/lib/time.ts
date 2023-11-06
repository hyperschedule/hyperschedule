type Digits = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type HourString = `0${Digits}` | `1${"0" | "1"}`;
type MinuteString = `${"0" | "1" | "2" | "3" | "4" | "5"}${Digits}`;
type TimeString = `${HourString}:${MinuteString}`;
type TimeStringAm = `${TimeString}am`;
type TimeStringPm = `${TimeString}pm`;
type TimeStringAmPm = TimeStringAm | TimeStringPm;

export function formatTime24(secondsSinceMidnight: number): TimeString {
    const hour = Math.floor(secondsSinceMidnight / 3600);
    const minute = Math.floor((secondsSinceMidnight % 3600) / 60);
    return `${hour}:${minute.toString().padStart(2, "0")}` as TimeString;
}

export function formatTime12(secondsSinceMidnight: number): TimeStringAmPm {
    const hour = Math.floor(secondsSinceMidnight / 3600);
    const minute = Math.floor((secondsSinceMidnight % 3600) / 60);
    if (hour > 11)
        return `${hour === 12 ? 12 : hour - 12}:${minute
            .toString()
            .padStart(2, "0")}pm` as TimeStringPm;
    return `${hour}:${minute.toString().padStart(2, "0")}am` as TimeStringAm;
}
