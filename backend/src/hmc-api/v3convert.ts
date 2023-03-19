import * as APIv4 from "hyperschedule-shared/api/v4";
import * as APIv3 from "hyperschedule-shared/api/v3";
import { createLogger } from "../logger";

const logger = createLogger("api.v3convert");

export function v3CourseFromV4Section(s: APIv4.Section): APIv3.Course {
    const startDate = stringifyCourseDate(s.startDate);
    const endDate = stringifyCourseDate(s.endDate);
    const { termCount, terms } = getSectionTermFractions(s.identifier);

    const schedules = [];
    for (const schedule of s.schedules) {
        const days = stringifyWeekdayEnumArray(schedule.days);
        const startTime = stringifyTime(schedule.startTime);
        const endTime = stringifyTime(schedule.endTime);
        for (const location of schedule.locations) {
            schedules.push({
                scheduleDays: days,
                scheduleStartDate: startDate,
                scheduleEndDate: endDate,
                scheduleStartTime: startTime,
                scheduleEndTime: endTime,
                scheduleTermCount: termCount,
                scheduleTerms: terms,
                scheduleLocation: location,
            });
        }
    }

    const sectionCodeString = APIv4.stringifySectionCode(s.identifier);
    const courseCodeString = APIv4.stringifyCourseCode(s.course.code);
    return {
        courseCode: sectionCodeString,
        courseName: s.course.title,
        courseSortKey: [sectionCodeString],
        courseMutualExclusionKey: [courseCodeString],
        courseDescription: s.course.description,
        courseInstructors: s.instructors.map((inst) => inst.name),
        courseTerm: stringifySectionTermCode(s.identifier),
        courseSchedule: schedules,
        courseCredits: s.credits,
        courseSeatsTotal: s.seatsTotal,
        courseSeatsFilled: s.seatsFilled,
        courseWaitlistLength: null,
        courseEnrollmentStatus: convertStatusEnum(s.status),
        permCount: s.permCount,
    };
}

export function v3CourseListFromV4SectionList(sections: APIv4.Section[]) {
    const courses = [];
    for (const section of sections) {
        courses.push(v3CourseFromV4Section(section));
    }
    return {
        data: {
            terms: {},
            courses,
        },
        error: null,
        full: true,
    };
}

function stringifyWeekdayEnumArray(arr: APIv4.WeekdayEnum[]): string {
    return arr.join("");
}

function stringifyTime(secs: number): string {
    if (secs < 0 || secs >= 24 * 60 * 60) {
        logger.error({ seconds: secs }, "Time out of range");
        secs = 0;
    }
    let total_minutes = secs / 60;

    if (!Number.isInteger(total_minutes)) {
        logger.error(
            { seconds: secs },
            "Time too precise to fit in hours:minutes format",
        );
        total_minutes = Math.floor(total_minutes);
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
            logger.error(
                { semesterHalf: half.number },
                "Semester fraction out of bounds",
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
): APIv3.EnrollmentStatusEnum {
    const V4SectionStatus = APIv4.SectionStatus;
    const V3EnrollmentStatus = APIv3.EnrollmentStatus;
    switch (status) {
        case V4SectionStatus.open:
            return V3EnrollmentStatus.open;
        case V4SectionStatus.closed:
            return V3EnrollmentStatus.closed;
        case V4SectionStatus.reopened:
            return V3EnrollmentStatus.reopened;
        case V4SectionStatus.unknown:
            return V3EnrollmentStatus.unknown;
    }
}
