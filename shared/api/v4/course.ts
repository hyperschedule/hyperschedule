/**
 * This module includes the type definitions for everything from APIv4.
 * While almost all types are aliased, we can always copy-paste
 * the original definitions here if we need to change the imported type. However,
 * we aren't sure if that's gonna happen so this avoids code duplication while being
 * compatible with future APIs.
 * @module
 */

// type alias for schema generation
type integer = number;

/**
 * All school codes are three letters for consistency. According to portal
 * there is no course taught at KGI
 */
export enum School {
    POM = "PO",
    HMC = "HM",
    PTZ = "PZ",
    CMC = "CM",
    SCR = "SC",
    CGU = "CG",
}

export enum Term {
    fall = "FA",
    spring = "SP",
    summer = "SU",
}

export enum SectionStatus {
    open = "O",
    closed = "C",
    reopened = "R",
    unknown = "U",
}

export enum Weekday {
    monday = "M",
    tuesday = "T",
    wednesday = "W",
    thursday = "R",
    friday = "F",
    saturday = "S",
    sunday = "U",
}

export interface TermIdentifier {
    year: integer;
    term: Term;
}

/**
 * For course start and end dates, used to identify half-semester types.
 */
export interface CourseDate {
    year: integer;
    month: integer;
    day: integer;
}

/**
 * CourseCode is what we can use to identify equivalent course offerings in
 * different semesters. As such, there is no year or semester attached to it.
 */
export interface CourseCode {
    /**
     * 2-4 letters code in all upper case, e.g. CSCI, PE, HSA
     */
    department: string;
    courseNumber: integer;
    suffix: string;
    // this is the last two letters of the course code, e.g. SC, HM, JT, AS, AF
    affiliation: string;
}

/** CourseIdentifier is the unique identifier we need to pinpoint a course offering
 * from the database. We may stringify it as something like
 * `TEST001 SC-05 2022/FA`.
 */
export interface SectionIdentifier extends CourseCode {
    sectionNumber: integer;
    year: integer;
    term: Term;
    // first or second or fifth half of the term,
    // e.g. F1 and F2 for fall, P1 and P2 for spring,
    // and H1/S1 through H5/S5 for the summer
    half: string;
}

export interface Schedule {
    /**
     * seconds since midnight.
     */
    startTime: number;
    /**
     * seconds since midnight.
     */
    endTime: number;

    days: Weekday[];
    /**
     * Location is an array because some classes have multiple locations.
     * This is especially common for lab classes.
     */
    locations: string[];
}

export interface Course {
    code: CourseCode;
    title: string;
    description: string;
    primaryAssociation: School;
    potentialError: boolean;
}

export interface Instructor {
    name: string;
}

export interface Section {
    identifier: SectionIdentifier;
    courseAreas: string[];
    credits: number;
    permCount: integer;
    seatsTotal: integer;
    seatsFilled: integer;
    status: SectionStatus;
    startDate: CourseDate;
    endDate: CourseDate;
    instructors: Instructor[];
    course: Course;
    schedules: Schedule[];
    // used to flag whether a parsing error has occurred. we rather let the users
    // know that some data might not be reliable than them finding out the hard way
    potentialError: boolean;
}
