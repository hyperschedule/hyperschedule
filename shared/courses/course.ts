/**
 * Types defined in this module represents all the data we ever wanted for
 * hyperschedule. However, due to limitations from our data sources, we do
 * not have access to certain fields. Fields we cannot populate are omitted in
 * the API.
 *
 * @module
 */
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
 * For course start and end dates, used to identify half-semester courses.
 */
export interface CourseDate {
    year: number;
    month: number;
    day: number;
}

/** CourseIdentifier is the unique identifier we need to pinpoint a course
 * from the database. We may stringify it as something like
 * `{courseCode} {school}-{sectionNumber} {year}/{term}`,
 * E.g. `TEST001 HMC-05 2022/FA`.
 */
export interface CourseIdentifier {
    courseCode: string;
    sectionNumber: number;
    year: number;
    term: Term;
    school: School;
}

/**
 * A course can be uniquely identified by a {@link CourseIdentifier}. This
 * implies that each section is its own course. While different sections for
 * the majority of the courses are the same (i.e. only differ in time),
 * sometimes different sections are completely different, such as
 * HSA010HM and CORE001SC.
 */
export interface Course {
    identifier: CourseIdentifier;

    title: string;
    description: string;

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
     * Some courses have special notes.
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
