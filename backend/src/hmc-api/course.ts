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
    parseCourseSection,
    parseCourseSectionSchedule,
    parsePermCount,
    parsesectionInstructor,
    parseStaff,
} from "./files";

import { buildings } from "./buildings";

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
        console.warn(`Malformed location code ${code}`);
        return code;
    }

    if (location === "ARR") return "Arranged location";
    else if (location === "TBA") return "To be announced";

    if (campus === "") {
        console.warn(`Malformed location code ${code}`);
        return code;
    }

    const dict = buildings[campus];
    if (dict === undefined) {
        console.warn(`Malformed location code ${code}`);
        return code;
    }

    const building = dict[location];
    if (building === undefined) {
        console.warn(`Malformed location code ${code}`);
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
        if (courseMap.get(c.code))
            console.warn(
                `Duplicate course key ${c.code}, overwriting existing data`,
            );

        let campus: APIv4.School;

        if (allCampuses.includes(c.campus)) {
            campus = c.campus as unknown as APIv4.School;
        } else {
            console.warn(
                `Course found with unknown primary association, skipping`,
            );
            console.warn(c);
            continue;
        }
        let courseCode: APIv4.CourseCode;
        try {
            courseCode = parseCXCourseCode(c.code);
        } catch (e) {
            console.error(e);
            continue;
        }

        courseMap.set(c.code, {
            title: c.title,
            // TODO: cleanup the mixed windows-1252 encoding
            description: c.description,
            primaryAssociation: campus,
            code: courseCode,
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
            console.warn("Nonexistent staff %o in altstaff", staff);
        // overwrite existing staff if there is a preferred name
        staffMap.set(staff.cxId, {
            name: staff.altName,
        });
    }
}

function processCourseSection(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    courseMap: Map<string, APIv4.Course>,
    courseSectionParsed: ReturnType<typeof parseCourseSection>,
) {
    const allSectionStatus = ["O", "C", "R"];

    for (let section of courseSectionParsed) {
        if (courseSectionMap.has(section.sectionID))
            console.warn("Duplicate course section %o", section);

        const course = courseMap.get(section.code);
        if (course === undefined) {
            console.warn(
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
            console.error(e);
            continue;
        }

        if (sid.sectionNumber !== parseInt(section.sectionNumber, 10))
            console.warn(
                "Mismatching section number, parsed section is %o, section data is %o",
                sid,
                section,
            );

        courseSectionMap.set(section.sectionID, {
            course,
            status,
            // TODO: handle possible NaN
            credits: parseFloat(section.credits),
            // TODO: link with POM API for course area
            courseAreas: [],
            instructors: [],
            schedules: [],
            identifier: sid,
            seatsTotal: parseInt(section.seatsTotal, 10),
            seatsFilled: parseInt(section.seatsFilled, 10),
            potentialError: false,
        });
    }
}

function processSectionInstructor(
    staffMap: Map<string, APIv4.Instructor>,
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    sectionInstructorParsed: ReturnType<typeof parsesectionInstructor>,
) {
    for (let instructor of sectionInstructorParsed) {
        const staff = staffMap.get(instructor.cxId);
        if (staff === undefined) {
            console.warn(
                `Nonexistent instructor ${instructor.cxId} for ${instructor.sectionID}`,
            );
            continue;
        }
        const section = courseSectionMap.get(instructor.sectionID);
        if (section === undefined) {
            console.warn(
                `Nonexistent section ${instructor.sectionID} in sectioninstructor`,
            );
            continue;
        }
        if (section.instructors!.includes(staff))
            console.warn(
                `duplicate instructor ${instructor.cxId} in ${instructor.sectionID}`,
            );
        else section.instructors!.push(staff);
    }
}

function processPermCount(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    permCountParsed: ReturnType<typeof parsePermCount>,
) {
    for (let perm of permCountParsed) {
        const section = courseSectionMap.get(perm.sectionID);
        if (section === undefined) {
            console.warn(`Nonexistent section ${perm.sectionID} in permcount`);
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

    // we don't really do any real processing here, just one more layer of cross-validation
    for (let session of calendarSessionSectionParsed) {
        const section = courseSectionMap.get(session.sectionID);
        if (section === undefined) {
            console.warn(
                `Nonexistent section ID ${session.sectionID} in calendarsssionsession`,
            );
            continue;
        }

        if (extractSectionTerm(section.identifier!) !== session.term) {
            console.warn(
                `Mismatching session term for section ${session.sectionID} in calendarsssionsession. Got ${session.term}`,
            );
        }
    }

    for (let session of calendarSessionParsed) {
        calendarMap.set(session.term, {
            start: parseCalendarDate(session.startDate),
            end: parseCalendarDate(session.endDate),
        });
    }
}

function processSectionSchedule(
    courseSectionMap: Map<string, Partial<APIv4.Section>>,
    courseSectionScheduleParsed: ReturnType<typeof parseCourseSectionSchedule>,
) {
    for (let schedule of courseSectionScheduleParsed) {
        const section = courseSectionMap.get(schedule.sectionID);
        if (section === undefined) {
            console.warn(
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
            // console.log(s.days.toString(),weekdays.toString())
            if (
                s.startTime === startTime &&
                s.endTime === endTime &&
                s.days.toString() === weekdays.toString()
            ) {
                if (s.locations.includes(location))
                    console.warn(
                        `Duplicate location in ${schedule.sectionID} section schedule`,
                    );
                else s.locations.push(location);
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
}): APIv4.Section[] {
    // course map contains course data needed for courses of all sections
    // whereas courseSectionMap contains section-specific information
    let courseMap: Map<string, APIv4.Course> = new Map();
    let courseSectionMap: Map<string, Partial<APIv4.Section>> = new Map();
    let staffMap: Map<string, APIv4.Instructor> = new Map();

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
    const sectionInstructorParsed = parsesectionInstructor(
        files.sectionInstructor,
    );
    const staffParsed = parseStaff(files.staff);

    processCourse(courseMap, courseParsed);
    processStaff(staffMap, staffParsed, altstaffParsed);
    processCourseSection(courseSectionMap, courseMap, courseSectionParsed);
    processSectionInstructor(
        staffMap,
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

    return Array.from(courseSectionMap.values()) as APIv4.Section[];
}
