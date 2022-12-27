import type * as APIv4 from "hyperschedule-shared/api/v4";

const courseRegex = RegExp(
    "^" +
        "(?<dept>[A-Z ]{4})" +
        "(?<number>\\d{3})" +
        "(?<suffix>[A-Z0-9 ]{2}| {0,2})" +
        "(?<affiliation>[A-Z]{2})" +
        "$",
);

/**
 * The course code in CX comes in form of 11 characters, for example,
 * AFRI121IOAF, ART 005  PO, BIOL044LXKS, CSCI062 LPO
 */
export function parseCXCourseCode(code: string): APIv4.CourseCode {
    const match = courseRegex.exec(code);
    if (match === null) throw Error(`Malformed course code ${code}`);

    const groups = match.groups as {
        dept: string;
        number: string;
        suffix: string;
        affiliation: string;
    };

    return {
        department: groups.dept.trim(),
        courseNumber: parseInt(groups.number.trim(), 10),
        suffix: groups.suffix.trim(),
        affiliation: groups.affiliation.trim(),
    };
}

const sectionRegex = RegExp(
    "^" +
        "(?<dept>[A-Z ]{4})" +
        "(?<number>\\d{3})" +
        "(?<suffix>[A-Z0-9 ]{2}| {0,2})" +
        "(?<affiliation>[A-Z]{2})-" +
        "(?<section>\\d{2}) " +
        "(?<term>FA|SU|SP)" +
        "(?<year>\\d{4})" +
        "(?<half>(?:[FSPH])\\d)?" +
        "$",
);

/**
 * the section identifier in CX is similar to course code, except it also has year and section.
 * For example, CSCI062 LPO-01 SP2023, ENGR072  HM-01 SP2023P1
 */
export function parseCXSectionIdentifier(
    code: string,
): APIv4.SectionIdentifier {
    const match = sectionRegex.exec(code);
    if (match === null) throw Error(`Malformed course code ${code}`);

    const groups = match.groups as {
        dept: string;
        number: string;
        suffix: string;
        affiliation: string;
        section: string;
        term: string;
        year: string;
        half?: string;
    };

    return {
        department: groups.dept.trim(),
        courseNumber: parseInt(groups.number.trim(), 10),
        suffix: groups.suffix.trim(),
        affiliation: groups.affiliation.trim(),
        sectionNumber: parseInt(groups.section.trim(), 10),
        term: groups.term.trim() as APIv4.Term,
        year: parseInt(groups.year.trim(), 10),
        half: groups.half?.trim() ?? "",
    };
}
