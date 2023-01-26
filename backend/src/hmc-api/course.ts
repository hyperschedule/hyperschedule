import * as APIv4 from "hyperschedule-shared/api/v4";
import {
    parseCXSectionIdentifier,
    parseCXCourseCode,
} from "hyperschedule-shared/api/v4/course-code";
import {
    parseAltStaff,
    parseCalendarSession,
    parseCalendarSessionSection,
    parseCourse,
    parseCourseAreas,
    parseCourseSection,
    parseCourseSectionSchedule,
    parsePermCount,
    parseSectionInstructor,
    parseStaff,
} from "./files";

import { buildings } from "./buildings";
import { createLogger } from "../logger";
import { stringifySectionCodeLong } from "hyperschedule-shared/api/v4";

const logger = createLogger("parser.hmc.link");

/**
 * re-serialize term to its string form from SectionIdentifier
 */
function extractSectionTerm(id: APIv4.SectionIdentifier): string {
    return `${id.term}${id.year}${id.half}`;
}

const dateRegex = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;

/**
 * converts date in string to APIv4 format
 * @param date: date in the format of yyyy-mm-dd
 */
function parseCalendarDate(date: string): APIv4.CourseDate {
    const match = dateRegex.exec(date);
    if (match === null) throw Error(`Malformed date ${date}`);

    const groups = match.groups as {
        year: string;
        month: string;
        day: string;
    };

    // TODO: handle possible NaN and perform other date validation
    return {
        year: parseInt(groups.year, 10),
        month: parseInt(groups.month, 10),
        day: parseInt(groups.day, 10),
    };
}

/**
 * parse time in the string format and converts it to number of seconds since midnight
 * @param time: the time string. e.g. 1100 for 11:00, 935 for 9:35, 0 for 12:00
 */
function parseTime(time: string): number {
    const padded = time.padStart(4, "0");
    const hr = parseInt(padded.slice(0, 2), 10);
    const mn = parseInt(padded.slice(2, 4), 10);
    if (hr > 23 || hr < 0 || mn > 60 || mn < 0)
        throw Error(`Malformated time ${time}`);

    return hr * 3600 + mn * 60;
}

const weekdaysInOrder = [
    APIv4.Weekday.sunday,
    APIv4.Weekday.monday,
    APIv4.Weekday.tuesday,
    APIv4.Weekday.wednesday,
    APIv4.Weekday.thursday,
    APIv4.Weekday.friday,
    APIv4.Weekday.saturday,
];

/**
 * parse weekdays in the format of, e.g. -M-W-F-, to an array of weekdays
 * @param weekdays
 */
function parseWeekdays(weekdays: string): APIv4.Weekday[] {
    const res: APIv4.Weekday[] = [];
    if (weekdays.length !== 7)
        throw Error(`Malformed weekday string ${weekdays}`);

    for (let i = 0; i < 7; i++) {
        const c = weekdays[i];
        if (c === "-") continue;
        const weekday = weekdaysInOrder[i]!;
        if (c === weekday) res.push(weekday);
        else throw Error(`Malformed weekday string ${weekdays}`);
    }

    return res;
}

/**
 * converts the building code in the form of, e.g. HM SHAN 2465, to a more human-readable location
 * if any field is missing, there should still be a space
 */
function parseBuildingCode(code: string): string {
    const [campus, location, room] = code.split(" ");
    if (campus === undefined || location === undefined || room === undefined) {
        // if we cannot parse the code, just return it as-is because humans might be able to
        // interpret them
        logger.trace(`Malformed location code ${code}`);
        return code;
    }

    if (location === "ARR") return "Arranged location";
    else if (location === "TBA") return "To be announced";

    if (campus === "") {
        logger.trace(`Malformed location code ${code}`);
        return code;
    }

    const dict = buildings[campus];
    if (dict === undefined) {
        logger.trace(`Malformed location code ${code}`);
        return code;
    }

    const building = dict[location];
    if (building === undefined) {
        logger.trace(`Malformed location code ${code}`);
        return code;
    }

    // trim this because room might be empty string
    return `${building} ${room}`.trim();
}

function processCourse(
    courseMap: Map<string, APIv4.Course>,
    courseParsed: ReturnType<typeof parseCourse>,
) {
    const allCampuses: string[] = Object.values(APIv4.School);
    for (let c of courseParsed) {
        let potentialError = courseMap.has(c.code);

        let campus: APIv4.School;

        if (allCampuses.includes(c.campus)) {
            campus = c.campus as unknown as APIv4.School;
        } else {
            logger.trace(
                `Course found with unknown primary association, skipping`,
            );
            logger.trace(c);
            continue;
        }
        let courseCode: APIv4.CourseCode;
        try {
            courseCode = parseCXCourseCode(c.code);
        } catch (e) {
            logger.error(e);
            continue;
        }

        if (potentialError) {
            const prevData = courseMap.get(c.code)!;
            if (
                !prevData.potentialError &&
                prevData.description === c.description &&
                prevData.primaryAssociation === campus &&
                prevData.title === c.title
            ) {
                logger.trace(
                    `Duplicate course key ${c.code} with no difference`,
                );
                potentialError = false;
            } else {
                logger.warn(
                    `Duplicate course key ${c.code} with differences, overwriting existing data`,
                );
            }
        }

        courseMap.set(c.code, {
            title: c.title,
            // TODO: cleanup the mixed windows-1252 encoding
            description: c.description,
            primaryAssociation: campus,
            code: courseCode,
            potentialError,
        });
    }
}

function processStaff(
    staffMap: Map<string, APIv4.Instructor>,
    staffParsed: ReturnType<typeof parseStaff>,
    altstaffParsed: ReturnType<typeof parseAltStaff>,
) {
    for (let staff of staffParsed) {
        staffMap.set(staff.cxId, {
            name: `${staff.lastname}, ${staff.firstname}`,
        });
    }
    for (let staff of altstaffParsed) {
        if (!staffMap.has(staff.cxId))
            logger.trace("Nonexistent staff %o in altstaff", staff);
        // overwrite existing staff if there is a preferred name
        staffMap.set(staff.cxId, {
            name: staff.altName,
        });
    }
}

function processCourseSection(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    dupeMap: Map<string, number>,
    courseMap: Map<string, APIv4.Course>,
    courseAreaMap: Map<string, string[]>,
    courseSectionParsed: ReturnType<typeof parseCourseSection>,
) {
    const allSectionStatus = ["O", "C", "R"];

    for (let section of courseSectionParsed) {
        let potentialError: boolean = courseSectionMap.has(section.sectionID);
        const course = courseMap.get(section.code);
        if (course === undefined) {
            logger.trace(
                "Course section without course, skipping... %o",
                section,
            );
            continue;
        }

        let status: APIv4.SectionStatus;
        if (allSectionStatus.includes(section.status))
            status = section.status as APIv4.SectionStatus;
        else status = APIv4.SectionStatus.unknown;

        let sid: APIv4.SectionIdentifier;
        try {
            sid = parseCXSectionIdentifier(section.sectionID);
        } catch (e) {
            logger.error(e);
            continue;
        }

        if (sid.sectionNumber !== parseInt(section.sectionNumber, 10))
            logger.info(
                "Mismatching section number, section ID is %s, section data is %s",
                section.sectionID,
                section.sectionNumber,
            );
        // TODO: handle possible NaN
        const credits = parseFloat(section.credits);
        const seatsTotal = parseInt(section.seatsTotal, 10);
        const seatsFilled = parseInt(section.seatsFilled, 10);

        const courseAreas: string[] = courseAreaMap.get(section.code) ?? [];

        if (potentialError) {
            const n = dupeMap.get(section.sectionID);
            if (n) dupeMap.set(section.sectionID, n + 1);
            else dupeMap.set(section.sectionID, 1);
            const prevData = courseSectionMap.get(section.sectionID)!;

            // we double-check that two data are the same. if they are, remove the error
            // flag. if flagged for error previously then we keep the flag

            if (
                // we don't need to compare prevData.identifier here
                // because we know they are the same
                !prevData.potentialError &&
                prevData.course === course &&
                prevData.status === status &&
                prevData.credits === credits &&
                prevData.seatsFilled === seatsFilled &&
                prevData.seatsTotal === seatsTotal
            ) {
                potentialError = false;
                logger.trace(
                    "Duplicate course section for %s, no differences",
                    section.sectionID,
                );
            } else {
                logger.trace(
                    "Duplicate course section for %s, different values ",
                    section.sectionID,
                );
            }
        }

        courseSectionMap.set(section.sectionID, {
            course,
            status,
            credits,
            courseAreas,
            instructors: [],
            schedules: [],
            identifier: sid,
            seatsTotal,
            seatsFilled,
            potentialError,
        });
    }
}

function processSectionInstructor(
    staffMap: Map<string, APIv4.Instructor>,
    dupeMap: Map<string, number>,
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    sectionInstructorParsed: ReturnType<typeof parseSectionInstructor>,
) {
    let dupesSeen: Map<string, number> = new Map();
    for (let instructor of sectionInstructorParsed) {
        const staff = staffMap.get(instructor.cxId);
        const section = courseSectionMap.get(instructor.sectionID);
        if (section === undefined) {
            logger.trace(
                `Nonexistent section ${instructor.sectionID} in sectioninstructor`,
            );
            continue;
        }

        if (staff === undefined) {
            logger.trace(
                `Nonexistent instructor ${instructor.cxId} for ${instructor.sectionID}`,
            );
            section.potentialError = true;
            continue;
        }

        if (section.instructors!.includes(staff)) {
            if (!dupeMap.has(instructor.sectionID)) {
                section.potentialError = true;
                logger.trace(
                    `duplicate instructor ${instructor.cxId} in ${instructor.sectionID}, no previous duplicate section`,
                );
            } else {
                const prevVal = dupesSeen.get(instructor.sectionID);
                dupesSeen.set(
                    instructor.sectionID,
                    prevVal === undefined ? 1 : prevVal + 1,
                );
            }
        } else section.instructors!.push(staff);
    }

    for (let [id, n] of dupeMap.entries()) {
        // if there is exactly number of copies of instructor as the course section number,
        // n should be 0 for those courses

        const section = courseSectionMap.get(id)!;
        if (dupesSeen.get(id) !== n * section.instructors!.length) {
            section.potentialError = true;
            logger.trace(
                `duplicate instructor in ${id} with mismatching duplicate section`,
            );
        }
    }
}

function processPermCount(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    permCountParsed: ReturnType<typeof parsePermCount>,
) {
    for (let perm of permCountParsed) {
        const section = courseSectionMap.get(perm.sectionID);
        if (section === undefined) {
            logger.trace(`Nonexistent section ${perm.sectionID} in permcount`);
            continue;
        }
        section.permCount = parseInt(perm.permCount, 10);
    }
}

function processCalendar(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    calendarSessionParsed: ReturnType<typeof parseCalendarSession>,
    calendarSessionSectionParsed: ReturnType<
        typeof parseCalendarSessionSection
    >,
) {
    let calendarMap: Map<
        string,
        {
            start: APIv4.CourseDate;
            end: APIv4.CourseDate;
        }
    > = new Map();

    for (let session of calendarSessionParsed) {
        calendarMap.set(session.term, {
            start: parseCalendarDate(session.startDate),
            end: parseCalendarDate(session.endDate),
        });
    }

    for (let session of calendarSessionSectionParsed) {
        const section = courseSectionMap.get(session.sectionID);
        if (section === undefined) {
            logger.trace(
                `Nonexistent section ID ${session.sectionID} in calendarsssionsession`,
            );
            continue;
        }

        if (extractSectionTerm(section.identifier!) !== session.term) {
            logger.trace(
                `Mismatching session term for section ${session.sectionID} in calendarsssionsession. Got ${session.term}`,
            );
        }

        const calendar = calendarMap.get(session.term);
        if (calendar === undefined) {
            logger.trace("Nonexistent calendar session %s", session.term);
            section.potentialError = true;
            section.startDate = { year: 1970, month: 1, day: 1 };
            section.endDate = { year: 1970, month: 1, day: 1 };
        } else {
            section.startDate = calendar.start;
            section.endDate = calendar.end;
        }
    }
}

function processSectionSchedule(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    courseSectionScheduleParsed: ReturnType<typeof parseCourseSectionSchedule>,
) {
    for (let schedule of courseSectionScheduleParsed) {
        const section = courseSectionMap.get(schedule.sectionID);
        if (section === undefined) {
            logger.trace(
                `Nonexistent section ID ${schedule.sectionID} in coursesectionschedule`,
            );
            continue;
        }

        const startTime = parseTime(schedule.beginTime);
        const endTime = parseTime(schedule.endTime);
        const weekdays = parseWeekdays(schedule.meetingDays);
        const location = parseBuildingCode(schedule.location);

        let merged: boolean = false;
        for (let s of section.schedules!) {
            // merge locations if multiple
            if (
                s.startTime === startTime &&
                s.endTime === endTime &&
                s.days.toString() === weekdays.toString()
            ) {
                if (s.locations.includes(location)) {
                    logger.trace(
                        `Duplicate location in ${schedule.sectionID} section schedule`,
                    );
                    section.potentialError = true;
                } else s.locations.push(location);
                merged = true;
                break;
            }
        }

        if (!merged) {
            section.schedules!.push({
                startTime,
                endTime,
                days: weekdays,
                locations: [location],
            });
        }
    }
}

function processCourseAreas(
    courseAreasParsed: ReturnType<typeof parseCourseAreas>,
    courseAreaMap: Map<string, string[]>,
) {
    for (let area of courseAreasParsed) {
        if (courseAreaMap.has(area.course_code))
            logger.trace(
                `Duplicate course ${area.course_code} for course area`,
            );
        courseAreaMap.set(area.course_code, area.course_areas);
    }
}

export function linkCourseData(files: {
    altstaff: string;
    calendarSession: string;
    calendarSessionSection: string;
    course: string;
    courseSection: string;
    courseSectionSchedule: string;
    permCount: string;
    sectionInstructor: string;
    staff: string;
    courseAreas: string;
}): APIv4.Section[] {
    // course map contains course data needed for courses of all sections
    // whereas courseSectionMap contains section-specific information
    let courseMap: Map<string, APIv4.Course> = new Map();
    let courseSectionMap: Map<string, Partial<APIv4.Section>> = new Map();
    let staffMap: Map<string, APIv4.Instructor> = new Map();
    let dupeMap: Map<string, number> = new Map();
    let courseAreaMap: Map<string, string[]> = new Map();

    const altstaffParsed = parseAltStaff(files.altstaff);
    const calendarSessionParsed = parseCalendarSession(files.calendarSession);
    const calendarSessionSectionParsed = parseCalendarSessionSection(
        files.calendarSessionSection,
    );
    const courseParsed = parseCourse(files.course);
    const courseSectionParsed = parseCourseSection(files.courseSection);
    const courseSectionScheduleParsed = parseCourseSectionSchedule(
        files.courseSectionSchedule,
    );
    const permCountParsed = parsePermCount(files.permCount);
    const sectionInstructorParsed = parseSectionInstructor(
        files.sectionInstructor,
    );
    const staffParsed = parseStaff(files.staff);
    const courseAreaParsed = parseCourseAreas(files.courseAreas);

    processCourse(courseMap, courseParsed);
    processCourseAreas(courseAreaParsed, courseAreaMap);
    processStaff(staffMap, staffParsed, altstaffParsed);
    processCourseSection(
        courseSectionMap,
        dupeMap,
        courseMap,
        courseAreaMap,
        courseSectionParsed,
    );
    processSectionInstructor(
        staffMap,
        dupeMap,
        courseSectionMap,
        sectionInstructorParsed,
    );
    processPermCount(courseSectionMap, permCountParsed);
    processCalendar(
        courseSectionMap,
        calendarSessionParsed,
        calendarSessionSectionParsed,
    );
    processSectionSchedule(courseSectionMap, courseSectionScheduleParsed);

    const res: Partial<APIv4.Section>[] = Array.from(courseSectionMap.values());
    for (let section of res) {
        if (section.permCount === undefined) section.permCount = 0;
        const validatedResult = APIv4.Section.safeParse(section);
        if (!validatedResult.success) {
            if (process.env.NODE_ENV === "production")
                logger.warn(
                    "invalid section %o, reason %o",
                    section,
                    validatedResult.error,
                );
            else {
                logger.error(
                    "invalid section %o, reason %o",
                    section,
                    validatedResult.error,
                );
                throw Error(
                    `Invalid section ${stringifySectionCodeLong(
                        (section as APIv4.Section).identifier,
                    )}`,
                );
            }
            // apparently typescript thinks section is of type never,
            // probably because the schema check earlier
            (section as Partial<APIv4.Section>).potentialError = true;
        }
    }
    return res as APIv4.Section[];
}
