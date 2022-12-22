import { parse } from "./parser";

/**
 * parser for coursesection_1.csv
 */
export function parseCourseSection(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                codeWithTerm: "externalId",
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
}

/**
 * parser for coursesectionschedule_1.csv
 */
export function parseCourseSectionSchedule(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                externalId: "externalId",
                codeWithTerm: "courseSectionExternalId",
                beginTime: "classBeginningTime",
                endTime: "classEndingTime",
                meetingDays: "classMeetingDays",
                location: "InstructionSiteName",
                locationType: "InstructionSiteType",
            },
        },
        data,
    );
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
    if (result.ok) {
        for (let r of result.records) {
            r.description = r.description.replaceAll("||``||", "\n");
        }
        for (let w of result.warnings) {
            console.warn(w);
        }
    } else {
        console.error(result.missingColumns);
        throw Error(
            "Cannot parse course, missing columns " +
            JSON.stringify(result.missingColumns),
        );
    }

    return result.records;
}

/**
 * parser for permcount_1.csv
 */
export function parsePermCount(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                codeWithTerm: "permCountExternalId",
                permCount: "PermCount",
            },
        },
        data,
    );
}

/**
 * parser for staff_1.csv
 */
export function parseStaff(data: string) {
    return parse(
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
}

/**
 * parser for altstaff_1.csv
 */
export function parseAltStaff(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                cxId: "ExternalId",
                firstname: "firstName",
                lastname: "lastName",
                altName: "altName",
            },
        },
        data,
    );
}

/**
 * parser for calendarsessionsection_1.csv
 */
export function parseCalendarSessionSection(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                term: "calendarSessionExternalId",
                codeWithTerm: "courseSectionExternalId",
            },
        },
        data,
    );
}

/**
 * parser for calendarsession_1.csv
 */
export function parseCalendarSession(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                externalID: "externalId",
                term: "designator",
                startDate: "beginDate",
                endDate: "EndDate",
            },
        },
        data,
    );
}
