import { parse } from "./parser";
import type { Result } from "./parser";
import { z } from "zod";
import { createLogger } from "@/logger";
const logger = createLogger("parser.hmc.file");

function processResult<T>(
    result: Result<T>,
    filename: string,
): Record<keyof T, string>[] {
    if (result.ok) {
        for (let w of result.warnings) {
            logger.warn("Warning while parsing %s, %o", filename, w);
        }
        return result.records;
    } else {
        logger.error(
            "Cannot parse %s, missing columns %o",
            filename,
            result.missingColumns,
        );
        throw Error(
            `Cannot parse ${filename}, missing columns ` +
                JSON.stringify(result.missingColumns),
        );
    }
}

/**
 * parser for coursesection_1.csv
 */
export function parseCourseSection(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                sectionID: "externalId",
                code: "courseExternalId",
                sectionNumber: "coureSectionNumber",
                seatsTotal: "capacity",
                seatsFilled: "currentEnrollment",
                status: "Status",
                credits: "CreditHours",
            },
        },
        data,
    );
    return processResult(result, "courseSection");
}

/**
 * parser for coursesectionschedule_1.csv
 */
export function parseCourseSectionSchedule(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                externalId: "externalId",
                sectionID: "courseSectionExternalId",
                beginTime: "classBeginningTime",
                endTime: "classEndingTime",
                meetingDays: "classMeetingDays",
                location: "InstructionSiteName",
                locationType: "InstructionSiteType",
            },
        },
        data,
    );
    return processResult(result, "courseSectionSchedule");
}

/**
 * parser for course_1.csv
 */
export function parseCourse(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: "||`||",
            fields: {
                code: "externalId",
                title: "courseTitle",
                campus: "institutionExternalId",
                description: "description",
            },
        },
        data,
    );
    const courses = processResult(result, "course");
    for (let c of courses) {
        c.description = c.description.replaceAll("||``||", "\n");
    }
    return courses;
}

/**
 * parser for permcount_1.csv
 */
export function parsePermCount(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                sectionID: "permCountExternalId",
                permCount: "PermCount",
            },
        },
        data,
    );
    return processResult(result, "permCount");
}

/**
 * parser for staff_1.csv
 */
export function parseStaff(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                cxId: "ExternalId",
                firstname: "firstName",
                lastname: "lastName",
            },
        },
        data,
    );
    return processResult(result, "staff");
}

/**
 * parser for altstaff_1.csv
 */
export function parseAltStaff(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                cxId: "externalId",
                firstname: "firstName",
                lastname: "lastName",
                altName: "altName",
            },
        },
        // manually changed the escaped comma to something else
        // temporarily so our silly parser can work correctly
        data.replaceAll("\\,", "|"),
    );
    const processed = processResult(result, "altstaff");
    for (let staff of processed) {
        staff.altName = staff.altName.replaceAll("|", ",");
    }
    return processed;
}

/**
 * parser for calendarsessionsection_1.csv
 */
export function parseCalendarSessionSection(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                term: "calendarSessionExternalId",
                sectionID: "courseSectionExternalId",
            },
        },
        data,
    );
    return processResult(result, "calendarSessionSection");
}

/**
 * parser for calendarsession_1.csv
 */
export function parseCalendarSession(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                term: "externalId",
                designator: "designator",
                startDate: "beginDate",
                endDate: "EndDate",
            },
        },
        data,
    );
    return processResult(result, "calendarSession");
}

/**
 * parser for sectioninstructor_1.csv
 */
export function parseSectionInstructor(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                sectionID: "courseSectionExternalId",
                cxId: "staffExternalId",
            },
        },
        data,
    );
    return processResult(result, "sectionInstructor");
}

const CourseAreaSource = z
    .object({
        course_code: z.string(),
        catalog: z.string().length(4),
        course_areas: z.string().min(1).max(4).array(),
    })
    .array();

export function parseCourseAreas(
    data: string,
): z.infer<typeof CourseAreaSource> {
    const obj = JSON.parse(data);
    const res = CourseAreaSource.safeParse(obj);
    if (res.success) return res.data;
    else {
        logger.error("Error while parsing course_areas.json. %O", res.error);
        return [];
    }
}
