import * as APIv4 from "../v4";

type integer = number;

export interface Course {
    courseCode: string;
    courseName: string;
    courseSortKey: string[];
    courseMutualExclusionKey: string[];
    courseDescription: string;
    courseInstructors: string[];
    courseTerm: string;
    courseSchedule: Schedule[];
    courseCredits: number;
    courseSeatsTotal: integer;
    courseSeatsFilled: integer;
    courseWaitlistLength: null;
    courseEnrollmentStatus: string;
    permCount: integer;
}

export interface Schedule {
    scheduleDays: string;
    scheduleStartTime: string;
    scheduleEndTime: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    scheduleTermCount: integer;
    scheduleTerms: integer[];
    scheduleLocation: string;
}

export function courseFromV4Section(s: APIv4.Section): Course {
    const sectionCodeString = APIv4.stringifySectionCode(s.identifier);
    const courseCodeString = APIv4.stringifyCourseCode(s.course.code);

    const startDate = stringifyCourseDate(s.startDate);
    const endDate = stringifyCourseDate(s.endDate);

    const { termCount, terms } = getSectionTermFractions(s.identifier);

    return {
        courseCode: sectionCodeString,
        courseName: s.course.title,
        courseSortKey: [sectionCodeString],
        courseMutualExclusionKey: [courseCodeString],
        courseDescription: s.course.description,
        courseInstructors: s.instructors.map((inst) => inst.name),
        courseTerm: stringifySectionTermCode(s.identifier),
        courseSchedule: s.schedules.flatMap((schedule) => {
            const days = stringifyWeekdayEnumArray(schedule.days);
            const startTime = stringifyTime(schedule.startTime);
            const endTime = stringifyTime(schedule.endTime);
            return schedule.locations.map((location) => ({
                scheduleDays: days,
                scheduleStartTime: startTime,
                scheduleEndTime: endTime,
                scheduleStartDate: startDate,
                scheduleEndDate: endDate,
                scheduleTermCount: termCount,
                scheduleTerms: terms,
                scheduleLocation: location,
            }));
        }),
        courseCredits: s.credits,
        courseSeatsTotal: s.seatsTotal,
        courseSeatsFilled: s.seatsFilled,
        courseWaitlistLength: null,
        courseEnrollmentStatus: stringifySectionStatusEnum(s.status),
        permCount: s.permCount,
    };
}

function stringifyWeekdayEnumArray(arr: APIv4.WeekdayEnum[]): string {
    return arr.join("");
}

function stringifyTime(secs: integer): string {
    if (secs < 0 || secs >= 24 * 60 * 60) {
        throw Error(`Time out of range: ${secs}`);
    }
    const total_minutes = secs / 60;

    if (!Number.isInteger(total_minutes)) {
        throw Error(`Time too precise to fit in hours:minutes format: ${secs}`);
    }

    const hours = Math.floor(total_minutes / 60);
    const minutes = total_minutes % 60;

    const hours_string = hours.toString().padStart(2, "0");
    const minutes_string = minutes.toString().padStart(2, "0");

    return `${hours_string}:${minutes_string}`;
}

function stringifyCourseDate(date: APIv4.CourseDate): string {
    const padded_month = date.month.toString().padStart(2, "0");
    const padded_day = date.day.toString().padStart(2, "0");
    return `${date.year}-${padded_month}-${padded_day}`;
}

function stringifySectionTermCode(identifier: APIv4.SectionIdentifier): string {
    const half = identifier.half;
    const halfString = half !== null ? `${half.prefix}${half.number}` : "";
    return `${identifier.term}${identifier.year}${halfString}`;
}

function getSectionTermFractions(identifier: APIv4.SectionIdentifier): {
    termCount: number;
    terms: number[];
} {
    const half = identifier.half;
    if (half === null) {
        return {
            termCount: 1,
            terms: [0],
        };
    } else if (half.prefix === "F" || half.prefix === "P") {
        if (half.number > 2) {
            throw Error(
                `Fall/Spring semester divided into too many parts: ${half.number}`,
            );
        }
        return {
            termCount: 2,
            terms: [half.number - 1],
        };
    } else {
        // Best guess given available data
        return {
            termCount: half.number,
            terms: [half.number - 1],
        };
    }
}

function stringifySectionStatusEnum(status: APIv4.SectionStatusEnum): string {
    const SectionStatus = APIv4.SectionStatus;
    switch (status) {
        case SectionStatus.open:
            return "open";
        case SectionStatus.closed:
            return "closed";
        case SectionStatus.reopened:
            return "reopened";
        case SectionStatus.unknown:
            return "unknown";
    }
}
