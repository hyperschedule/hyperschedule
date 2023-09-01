import * as APIv4 from "hyperschedule-shared/api/v4";

export const CxCourseCodeRegex = RegExp(
    "^" +
        "(?<dept>[A-Z ]{4})" +
        "(?<number>\\d{3})" +
        "(?<suffix>[A-Z0-9 ]{2}| {0,2}) *" +
        "(?<affiliation>[A-Z]{2})" +
        "$",
);

/**
 * The course code in CX comes in form of 11 characters, for example,
 * AFRI121IOAF, ART 005  PO, BIOL044LXKS, CSCI062 LPO
 */
export function parseCXCourseCode(code: string): APIv4.CourseCode {
    const match = CxCourseCodeRegex.exec(code);
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

export const CxSectionIdRegex = RegExp(
    "^" +
        "(?<dept>[A-Z ]{4})" +
        "(?<number>\\d{3})" +
        "(?<suffix>[A-Z0-9 ]{2}| {0,2})" +
        "(?<affiliation>[A-Z]{2})-" +
        "(?<section>\\d{2}) " +
        "(?<term>FA|SU|SP)" +
        "(?<year>\\d{4})" +
        "(?:(?<halfPrefix>[FSPHZ])(?<halfNumber>\\d))?" +
        "$",
);

/**
 * the section identifier in CX is similar to course code, except it also has year and section.
 * For example, CSCI062 LPO-01 SP2023, ENGR072  HM-01 SP2023P1
 */
export function parseCXSectionIdentifier(
    code: string,
): APIv4.SectionIdentifier {
    const match = CxSectionIdRegex.exec(code);
    if (match === null) throw Error(`Malformed course code ${code}`);

    const groups = match.groups as {
        dept: string;
        number: string;
        suffix: string;
        affiliation: string;
        section: string;
        term: string;
        year: string;
        halfPrefix?: string;
        halfNumber?: string;
    };

    let half: APIv4.Half | null = null;
    if (groups.halfPrefix !== undefined && groups.halfNumber !== undefined)
        half = {
            prefix: groups.halfPrefix,
            number: parseInt(groups.halfNumber, 10),
        };

    return {
        department: groups.dept.trim(),
        courseNumber: parseInt(groups.number.trim(), 10),
        suffix: groups.suffix.trim(),
        affiliation: groups.affiliation.trim(),
        sectionNumber: parseInt(groups.section.trim(), 10),
        term: groups.term.trim() as APIv4.Term,
        year: parseInt(groups.year.trim(), 10),
        half,
    };
}

/**
 * converts course code to a human-friendly string form. E.g. `CSCI 005 HM`. Can be reversed by
 * {@link parseCXCourseCode}
 */
export function stringifyCourseCode(code: Readonly<APIv4.CourseCode>): string {
    return `${code.department} ${code.courseNumber
        .toString()
        .padStart(3, "0")}${code.suffix} ${code.affiliation}`;
}

export const courseCodeRegex =
    /^(?<dept>[A-Z]{1,4}) (?<number>\d{1,3})(?<suffix>[A-Z0-9]{0,2}) (?<affiliation>[A-Z]{2})$/;

/**
 * reverse function of {@link stringifyCourseCode}
 */
export function parseCourseCode(code: string): APIv4.CourseCode {
    const match = courseCodeRegex.exec(code);
    if (match === null) throw Error(`Malformed course code ${code}`);

    const groups = match.groups as {
        dept: string;
        number: string;
        suffix: string;
        affiliation: string;
    };

    return {
        department: groups.dept,
        courseNumber: parseInt(groups.number, 10),
        suffix: groups.suffix,
        affiliation: groups.affiliation,
    };
}

/**
 * Converts a section identifier to a short-form string without semester code, e.g. `CSCI 005 HM-01`.
 * This conversion is not reversible due to missing information
 */
export function stringifySectionCode(
    sectionID: Readonly<APIv4.SectionIdentifier>,
): string {
    return `${sectionID.department} ${sectionID.courseNumber
        .toString()
        .padStart(3, "0")}${sectionID.suffix} ${
        sectionID.affiliation
    }-${sectionID.sectionNumber.toString().padStart(2, "0")}`;
}

/**
 * Converts a section code to its long string form. e.g. `MCBI 118A HM-01 SP2023 P1`. Can be reversed by
 * {@link parseSectionCodeLong}
 */
export function stringifySectionCodeLong(
    sectionID: Readonly<APIv4.SectionIdentifier>,
): string {
    const half =
        sectionID.half === null
            ? ""
            : `${sectionID.half.prefix}${sectionID.half.number}`;

    return `${sectionID.department} ${sectionID.courseNumber
        .toString()
        .padStart(3, "0")}${sectionID.suffix} ${
        sectionID.affiliation
    }-${sectionID.sectionNumber.toString().padStart(2, "0")} ${sectionID.term}${
        sectionID.year
    } ${half}`.trim();
}

const sectionCodeLongRegex = RegExp(
    "^" +
        "(?<dept>[A-Z]{1,4}) " +
        "(?<number>\\d{3})" +
        "(?<suffix>[A-Z0-9]{0,2}) " +
        "(?<affiliation>[A-Z]{2})-" +
        "(?<section>\\d{2}) " +
        "(?<term>FA|SU|SP)" +
        "(?<year>\\d{4})" +
        "(?: (?<halfPrefix>[FSPHZ])(?<halfNumber>\\d))?" +
        "$",
);

/**
 * Reverse of {@link stringifySectionCodeLong}
 */
export function parseSectionCodeLong(code: string): APIv4.SectionIdentifier {
    const match = sectionCodeLongRegex.exec(code);
    if (match === null) throw Error(`Malformed long section code ${code}`);

    const groups = match.groups as {
        dept: string;
        number: string;
        suffix: string;
        affiliation: string;
        section: string;
        term: string;
        year: string;
        halfPrefix?: string;
        halfNumber?: string;
    };

    let half: APIv4.Half | null = null;
    if (groups.halfPrefix !== undefined && groups.halfNumber !== undefined)
        half = {
            prefix: groups.halfPrefix,
            number: parseInt(groups.halfNumber, 10),
        };

    return {
        department: groups.dept,
        courseNumber: parseInt(groups.number, 10),
        suffix: groups.suffix,
        affiliation: groups.affiliation,
        sectionNumber: parseInt(groups.section, 10),
        term: groups.term as APIv4.Term,
        year: parseInt(groups.year, 10),
        half,
    };
}

/**
 * return true if two course codes are equal, false otherwise
 */
export function compareCourseCode(
    a: Readonly<APIv4.CourseCode>,
    b: Readonly<APIv4.CourseCode>,
): boolean {
    return (
        a.affiliation === b.affiliation &&
        a.department === b.department &&
        a.courseNumber === b.courseNumber &&
        a.suffix === b.suffix
    );
}

/**
 * return true if two section identifiers are equal, false otherwise
 */
export function compareSectionIdentifier(
    a: Readonly<APIv4.SectionIdentifier>,
    b: Readonly<APIv4.SectionIdentifier>,
): boolean {
    return (
        a.department === b.department &&
        a.courseNumber === b.courseNumber &&
        a.suffix === b.suffix &&
        a.affiliation === b.affiliation &&
        a.sectionNumber === b.sectionNumber &&
        a.year === b.year &&
        a.term === b.term &&
        ((a.half === null && b.half === null) ||
            (a.half?.number === b.half?.number &&
                a.half?.prefix === b.half?.prefix))
    );
}

export function stringifyTermIdentifier(term: APIv4.TermIdentifier): string {
    return `${term.term}${term.year}`;
}

const termIdentifierRegex = /^(?<term>FA|SP|SU)(?<year>\d{4})$/;

export function parseTermIdentifier(term: string): APIv4.TermIdentifier {
    const match = termIdentifierRegex.exec(term);
    if (match === null) throw Error(`Malformed term identifier ${term}`);
    const groups = match.groups as {
        term: string;
        year: string;
    };
    return {
        term: groups.term,
        year: parseInt(groups.year, 10),
    } as APIv4.TermIdentifier;
}

export function schoolCodeToName(school: APIv4.School): string {
    switch (school) {
        case APIv4.School.CGU:
            return "Claremont Graduate University";
        case APIv4.School.CMC:
            return "Claremont McKenna";
        case APIv4.School.HMC:
            return "Harvey Mudd";
        case APIv4.School.POM:
            return "Pomona";
        case APIv4.School.SCR:
            return "Scripps";
        case APIv4.School.PTZ:
            return "Pitzer";
        case APIv4.School.Unknown:
            return "Unknown";
    }
}
