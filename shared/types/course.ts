import type { Requisite } from "./requisite";

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

export enum Weekday {
    monday = "M",
    tuesday = "T",
    wednesday = "W",
    thursday = "TR",
    friday = "F",
    saturday = "S",
    sunday = "SN",
}

/**
 * For course start and end dates, used to identify half-semester types.
 */
export interface CourseDate {
    year: number;
    month: number;
    day: number;
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
    courseNumber: number;
    suffix: string;
    school: School;
}

/** CourseIdentifier is the unique identifier we need to pinpoint a course offering
 * from the database. We may stringify it as something like
 * `TEST001 SC-05 2022/FA`.
 */
export interface CourseIdentifier extends CourseCode {
    sectionNumber: number;
    year: number;
    term: Term;
}

/**
 * A course can be uniquely identified by a {@link CourseIdentifier}. This
 * implies that each section is its own course. While different sections for
 * the majority of the types are the same (i.e. only differ in time),
 * sometimes different sections are completely different, such as
 * HSA010HM and CORE001SC.
 */
export interface Course {
    identifier: CourseIdentifier;

    title: string;
    description: string;
    /**
     * The letter code for the course area. It is not necessarily the same as
     * the course department. This is useful for people to filter the course
     * on portal so they know which dropdown to select
     */
    courseAreas: string[];

    /**
     * number of credits the course has in non-hmc credit.
     */
    credits: number;
    permCount: number;

    seatsTotal: number;
    /**
     * seats available is lower-capped at 0.
     */
    seatsAvailable: number;
    seatsTaken: number;

    schedules: Schedule[];

    startDate: CourseDate;
    endDate: CourseDate;

    /**
     * Some types have special notes.
     */
    notes: string;
    /**
     * A list of textbook names.
     */
    textbooks: string[];

    instructors: Instructor[];

    requisite: Requisite;
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
    locations: Location[];
}

export interface Location {
    buildingName: string;
    school: School;
    roomName: string;
}

export interface Instructor {
    name: string;
    email: string;
}
