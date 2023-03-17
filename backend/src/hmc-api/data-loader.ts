import { NoTransform, parseBoomi, parseJSON, Remove, renameTo } from "./parser";
import { createLogger } from "../logger";
import { z } from "zod";
import {
    CourseCode,
    CxCourseCodeString,
    CxSectionIdentifierString,
    parseCXCourseCode,
    parseCXSectionIdentifier,
    SectionIdentifier,
    SectionStatusEnum,
    SessionString,
} from "hyperschedule-shared/api/v4";
import { DecimalString, IntString } from "./fetcher/types";

const logger = createLogger("parser.hmc.data-loader");

/**
 * pre-process and validate the input data against the validator. skip entry if it's bad.
 */
function preprocessDataFromString<T>(
    data: string,
    inputValidator: z.ZodType<T>,
    inputFileName: string,
): T[] {
    const result: T[] = [];
    const obj = JSON.parse(data);
    if (!Array.isArray(obj)) {
        logger.error(`Input data for ${inputFileName} is not an array`);
        return [];
    }

    for (const item of obj) {
        const r = inputValidator.safeParse(item);
        if (r.success) {
            result.push(r.data);
        } else {
            logger.trace(
                "Unable to pre-process data item for %s. Data is %O. Errors: %O",
                inputFileName,
                item,
                r.error,
            );
        }
    }
    return result;
}

/*************************************************************
 * BEGIN parser and output definitions for course-section.json
 *************************************************************/

const courseSectionInput = z.object({
    courseSectionId: CxSectionIdentifierString,
    courseSectionNumber: IntString,
    capacity: IntString,
    currentEnrollment: IntString,
    status: SectionStatusEnum,
    creditHours: DecimalString,
});
const courseSectionOutput = z
    .object({
        sectionId: SectionIdentifier,
        sectionNumber: z.number().nonnegative(),
        seatsTotal: z.number().nonnegative(),
        seatsFilled: z.number().nonnegative(),
        status: SectionStatusEnum,
        credits: z.number().min(0).max(10),
    })
    .strict();
export type CourseSectionOutput = z.infer<typeof courseSectionOutput>[];

export function parseCourseSection(data: string): CourseSectionOutput {
    const intermediary = preprocessDataFromString(
        data,
        courseSectionInput,
        "course-section.json",
    );

    return parseJSON(intermediary, courseSectionOutput, {
        courseSectionId: (v) => ({
            name: "sectionId",
            value: parseCXSectionIdentifier(v),
        }),
        capacity: (v) => ({
            name: "seatsTotal",
            value: parseInt(v, 10),
        }),

        courseSectionNumber: (v) => ({
            name: "sectionNumber",
            value: parseInt(v, 10),
        }),
        status: NoTransform,
        creditHours: (v) => ({
            name: "credits",
            value: parseFloat(v),
        }),
        currentEnrollment: (v) => ({
            name: "seatsFilled",
            value: parseInt(v),
        }),
    });
}

/**********************************************************************
 * BEGIN parser and output definitions for course-section-schedule.json
 **********************************************************************/

const courseSectionScheduleInput = z.object({
    courseSectionId: CxSectionIdentifierString,
    classBeginningTime: IntString,
    classEndingTime: IntString,
    classMeetingDays: z.string().nonempty(),
    instructionSiteName: z.string().nonempty(),
});

const courseSectionScheduleOutput = z
    .object({
        sectionId: SectionIdentifier,
        beginTime: z.string(),
        endTime: z.string(),
        meetingDays: z.string(),
        location: z.string(),
    })
    .strict();
export type CourseSectionScheduleOutput = z.infer<
    typeof courseSectionScheduleOutput
>[];

export function parseCourseSectionSchedule(
    data: string,
): CourseSectionScheduleOutput {
    const intermediary = preprocessDataFromString(
        data,
        courseSectionScheduleInput,
        "course-section-schedule.json",
    );

    return parseJSON(intermediary, courseSectionScheduleOutput, {
        courseSectionId: (v) => ({
            name: "sectionId",
            value: parseCXSectionIdentifier(v),
        }),
        classBeginningTime: renameTo("beginTime"),
        classEndingTime: renameTo("endTime"),
        classMeetingDays: renameTo("meetingDays"),
        instructionSiteName: renameTo("location"),
    });
}

/*******************************************************
 * BEGIN parser and output definitions for courseRaw.txt
 *******************************************************/

export interface CourseOutput {
    code: string;
    title: string;
    campus: string;
    description: string;
}

export function parseCourseBoomi(data: string): CourseOutput[] {
    const result = parseBoomi(
        ["code", "title", null, null, "campus", "description"],
        data,
    );

    if (!result.ok) {
        logger.error(result.error, "Cannot parse Boomi database dump");
        throw Error(
            "Cannot parse Boomi database dump: " + JSON.stringify(result.error),
        );
    }

    for (const warning of result.warnings) {
        logger.warn(warning, "Warning parsing Boomi database dump");
    }
    return result.records;
}

/*********************************************************
 * BEGIN parser and output definitions for perm-count.json
 *********************************************************/

const permCountInput = z.object({
    courseSectionId: CxSectionIdentifierString,
    permCount: IntString,
});

const permCountOutput = z
    .object({
        sectionId: SectionIdentifier,
        permCount: z.number().nonnegative(),
    })
    .strict();
export type PermCountOutput = z.infer<typeof permCountOutput>[];

export function parsePermCount(data: string): PermCountOutput {
    const intermediary = preprocessDataFromString(
        data,
        permCountInput,
        "perm-count.json",
    );
    return parseJSON(intermediary, permCountOutput, {
        courseSectionId: (v) => ({
            name: "sectionId",
            value: parseCXSectionIdentifier(v),
        }),
        permCount: (v) => ({
            name: "permCount",
            value: parseInt(v, 10),
        }),
    });
}

/****************************************************
 * BEGIN parser and output definitions for staff.json
 ****************************************************/

const staffInput = z.object({
    cxId: IntString,
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
});
const staffOutput = z
    .object({
        cxId: IntString,
        firstName: z.string().nonempty(),
        lastName: z.string().nonempty(),
    })
    .strict();
export type StaffOutput = z.infer<typeof staffOutput>[];

export function parseStaff(data: string): StaffOutput {
    const intermediary = preprocessDataFromString(
        data,
        staffInput,
        "staff.json",
    );
    return parseJSON(intermediary, staffOutput, {
        cxId: NoTransform,
        firstName: NoTransform,
        lastName: NoTransform,
    });
}

/*******************************************************
 * BEGIN parser and output definitions for altstaff.json
 *******************************************************/

const altStaffInput = z.object({
    cxId: IntString,
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    altName: z.string().nonempty(),
});
const altStaffOutput = z
    .object({
        cxId: IntString,
        altName: z.string().nonempty(),
    })
    .strict();
export type AltStaffOutput = z.infer<typeof altStaffOutput>[];

export function parseAltStaff(data: string): AltStaffOutput {
    const intermediary = preprocessDataFromString(
        data,
        altStaffInput,
        "alt-staff.json",
    );
    return parseJSON(intermediary, altStaffOutput, {
        cxId: NoTransform,
        firstName: Remove,
        lastName: Remove,
        altName: (v) => {
            // altName comes in last, first format and we want to flip it
            const nameArr = v.split(",").map((s) => s.trim());
            if (nameArr.length !== 2)
                logger.trace(`Malformed alt staff name v`);
            return {
                name: "altName",
                value: `${nameArr[1]} ${nameArr[0]}`,
            };
        },
    });
}

/***********************************************************************
 * BEGIN parser and output definitions for calendar-session-section.json
 ***********************************************************************/

const calendarSessionSectionInput = z.object({
    calendarSessionExternalId: SessionString,
    courseSectionId: CxSectionIdentifierString,
});

const calendarSessionSectionOutput = z
    .object({
        session: SessionString,
        sectionId: SectionIdentifier,
    })
    .strict();

export type CalendarSessionSectionOutput = z.infer<
    typeof calendarSessionSectionOutput
>[];

export function parseCalendarSessionSection(
    data: string,
): CalendarSessionSectionOutput {
    const intermediary = preprocessDataFromString(
        data,
        calendarSessionSectionInput,
        "calendar-session-section.json",
    );
    return parseJSON(intermediary, calendarSessionSectionOutput, {
        calendarSessionExternalId: renameTo("session"),
        courseSectionId: (v) => ({
            name: "sectionId",
            value: parseCXSectionIdentifier(v),
        }),
    });
}

/***************************************************************
 * BEGIN parser and output definitions for calendar-session.json
 ***************************************************************/

const calendarSessionInput = z.object({
    externalId: SessionString,
    beginDate: IntString,
    endDate: IntString,
});
const calendarSessionOutput = z
    .object({
        session: SessionString,
        startDate: z.string(),
        endDate: z.string(),
    })
    .strict();
export type CalendarSessionOutput = z.infer<typeof calendarSessionOutput>[];

export function parseCalendarSession(data: string): CalendarSessionOutput {
    const intermediary = preprocessDataFromString(
        data,
        calendarSessionInput,
        "calendar-session.json",
    );
    return parseJSON(intermediary, calendarSessionOutput, {
        externalId: renameTo("session"),
        beginDate: renameTo("startDate"),
        endDate: NoTransform,
    });
}

/****************************************************************
 * BEGIN parser and output definitions for section-instructor.json
 ***************************************************************/

const sectionInstructorInput = z.object({
    courseSectionId: CxSectionIdentifierString,
    staffExternalIds: IntString.array(),
});
const sectionInstructorOutput = z
    .object({
        sectionId: SectionIdentifier,
        staff: IntString.array(),
    })
    .strict();
export type SectionInstructorOutput = z.infer<typeof sectionInstructorOutput>[];

export function parseSectionInstructor(data: string): SectionInstructorOutput {
    const intermediary = preprocessDataFromString(
        data,
        sectionInstructorInput,
        "section-instructor.json",
    );
    return parseJSON(intermediary, sectionInstructorOutput, {
        courseSectionId: (v) => ({
            name: "sectionId",
            // type assertion is necessary here because the deduced type of v is string|string[]
            // and we know for a fact it's not an array
            value: parseCXSectionIdentifier(v as string),
        }),
        staffExternalIds: renameTo("staff"),
    });
}

/****************************************************************
 * BEGIN parser and output definitions for course-area.json
 ***************************************************************/

const courseAreaInput = z.object({
    course_code: CxCourseCodeString,
    catalog: z.string().regex(/^UG[0-9]{2}$/),
    course_areas: z.string().nonempty().array(),
});
const courseAreaOutput = z
    .object({
        courseCode: CourseCode,
        catalog: z.string().regex(/^UG[0-9]{2}$/),
        courseAreas: z.string().nonempty().array(),
    })
    .strict();
export type CourseAreaOutput = z.infer<typeof courseAreaOutput>[];

export function parseCourseArea(data: string): CourseAreaOutput {
    const intermediary = preprocessDataFromString(
        data,
        courseAreaInput,
        "course-area.json",
    );
    return parseJSON(intermediary, courseAreaOutput, {
        course_code: (v) => ({
            name: "courseCode",
            value: parseCXCourseCode(v as string),
        }),
        catalog: NoTransform,
        course_areas: renameTo("courseAreas"),
    });
}
