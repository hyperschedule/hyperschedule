import * as APIv4 from "../v4";
import { z } from "zod";

type integer = number;

// export interface Course {
//     courseCode: string;
//     courseName: string;
//     courseSortKey: string[];
//     courseMutualExclusionKey: string[];
//     courseDescription: string;
//     courseInstructors: string[];
//     courseTerm: string;
//     courseSchedule: Schedule[];
//     courseCredits: number;
//     courseSeatsTotal: integer;
//     courseSeatsFilled: integer;
//     courseWaitlistLength: null;
//     courseEnrollmentStatus: string;
//     permCount: integer;
// }

const timeRegex = /\d{2}:\d{2}/;
const dateRegex = /\d{4}-\d{2}-\d{2}/;

export const Schedule = z.object({
    scheduleDays: z.string().regex(/[MTWRFSU]*/),
    scheduleStartTime: z.string().regex(timeRegex),
    scheduleEndTime: z.string().regex(timeRegex),
    scheduleStartDate: z.string().regex(dateRegex),
    scheduleEndDate: z.string().regex(dateRegex),
    scheduleTermCount: z.number().int().positive(),
    scheduleTerms: z.number().int().nonnegative().array(),
    scheduleLocation: z.string(),
});
export type Schedule = z.infer<typeof Schedule>;

export enum EnrollmentStatus {
    open = "open",
    closed = "closed",
    reopened = "reopened",
    unknown = "unknown",
}
export const EnrollmentStatusEnum = z.nativeEnum(EnrollmentStatus);
export type EnrollmentStatusEnum = z.infer<typeof EnrollmentStatusEnum>;

export const Course = z.object({
    courseCode: z.string(),
    courseName: z.string(),
    courseSortKey: z.string().array(),
    courseMutualExclusionKey: z.string().array(),
    courseDescription: z.string(),
    courseInstructors: z.string().array(),
    courseTerm: z.string(),
    courseSchedule: Schedule.array(),
    courseCredits: z.number().nonnegative(),
    courseSeatsTotal: z.number().int(),
    courseSeatsFilled: z.number().int(),
    courseWaitlistLength: z.null(),
    courseEnrollmentStatus: EnrollmentStatusEnum,
    permCount: z.number().int(),
});
export type Course = z.infer<typeof Course>;

// export interface Schedule {
//     scheduleDays: string;
//     scheduleStartTime: string;
//     scheduleEndTime: string;
//     scheduleStartDate: string;
//     scheduleEndDate: string;
//     scheduleTermCount: integer;
//     scheduleTerms: integer[];
//     scheduleLocation: string;
// }

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
        courseEnrollmentStatus: convertStatusEnum(s.status),
        permCount: s.permCount,
    };
}

export function courseListFromV4SectionList(sections: APIv4.Section[]): {
    terms: [];
    courses: Course[];
} {
    return {
        terms: [],
        courses: sections.flatMap((section) => {
            try {
                const course = courseFromV4Section(section);
                return [course];
            } catch (e) {
                console.error(e);
                return [];
            }
        }),
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

    const hoursString = hours.toString().padStart(2, "0");
    const minutesString = minutes.toString().padStart(2, "0");

    return `${hoursString}:${minutesString}`;
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

function convertStatusEnum(
    status: APIv4.SectionStatusEnum,
): EnrollmentStatusEnum {
    const SectionStatus = APIv4.SectionStatus;
    switch (status) {
        case SectionStatus.open:
            return EnrollmentStatus.open;
        case SectionStatus.closed:
            return EnrollmentStatus.closed;
        case SectionStatus.reopened:
            return EnrollmentStatus.reopened;
        case SectionStatus.unknown:
            return EnrollmentStatus.unknown;
    }
}
