/**
 * This module includes the type definitions for everything from APIv4.
 * While almost all types are aliased, we can always copy-paste
 * the original definitions here if we need to change the imported type. However,
 * we aren't sure if that's gonna happen so this avoids code duplication while being
 * compatible with future APIs.
 * @module
 */

import { z } from "zod";

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

export const SchoolEnum = z.nativeEnum(School);
export type SchoolEnum = z.infer<typeof SchoolEnum>;

export enum Term {
    fall = "FA",
    spring = "SP",
    summer = "SU",
}

export const TermEnum = z.nativeEnum(Term);
export type TermEnum = z.infer<typeof TermEnum>;

export enum SectionStatus {
    open = "O",
    closed = "C",
    reopened = "R",
    unknown = "U",
}

export const SectionStatusEnum = z.nativeEnum(SectionStatus);
export type SectionStatusEnum = z.infer<typeof SectionStatusEnum>;

export enum Weekday {
    monday = "M",
    tuesday = "T",
    wednesday = "W",
    thursday = "R",
    friday = "F",
    saturday = "S",
    sunday = "U",
}

export const WeekdayEnum = z.nativeEnum(Weekday);
export type WeekdayEnum = z.infer<typeof WeekdayEnum>;

export const TermIdentifier = z.object({
    year: z.number().min(2000).max(2100), // hopefully someone rewrote this by then?
    term: TermEnum,
});
export type TermIdentifier = z.infer<typeof TermIdentifier>;

export const TermIdentifierString = z.string().regex(/^(?:FA|SP|SU)\d{4}$/);
export type TermIdentifierString = z.infer<typeof TermIdentifierString>;

export const Half = z.object({
    prefix: z.string().length(1),
    number: z.number().positive().max(9),
});
export type Half = z.infer<typeof Half>;

/**
 * For course start and end dates, used to identify half-semester types.
 */
export const CourseDate = z.object({
    year: z.number().min(2000).max(2100),
    month: z.number().min(1).max(12),
    day: z.number().min(1).max(31),
});
export type CourseDate = z.infer<typeof CourseDate>;

/**
 * CourseCode is what we can use to identify equivalent course offerings in
 * different semesters. As such, there is no year or semester attached to it.
 */
export const CourseCode = z.object({
    department: z.string().min(1).max(4),
    courseNumber: z.number().min(0).max(999), // GOVT 999 CM is a real class
    suffix: z.string().min(0).max(2),
    affiliation: z.string().length(2),
});
export type CourseCode = z.infer<typeof CourseCode>;

/** SectionIdentifier is the unique identifier we need to pinpoint a course offering
 * from the database. We may stringify it as something like
 * `TEST 001 SC-05 FA2022`.
 */
export const SectionIdentifier = z.object({
    department: z.string().min(1).max(4),
    courseNumber: z.number().min(0).max(999), // GOVT 999 CM is a real class
    suffix: z.string().min(0).max(2),
    // this is the last two letters of the course code, e.g. SC, HM, JT, AS, AF
    affiliation: z.string().length(2),
    sectionNumber: z.number().positive(),
    year: z.number().min(2000).max(2100), // hopefully someone rewrote this by then?
    term: TermEnum,
    // first or second or fifth half of the term,
    // e.g. F1 and F2 for fall, P1 and P2 for spring,
    // and H1/S1 through H5/S5 for the summer
    half: Half.nullable(),
});
export type SectionIdentifier = z.infer<typeof SectionIdentifier>;

export const Schedule = z.object({
    /**
     * seconds since midnight.
     */
    startTime: z
        .number()
        .min(0)
        .max(60 * 60 * 24 - 1),
    /**
     * seconds since midnight.
     */
    endTime: z
        .number()
        .min(0)
        .max(60 * 60 * 24 - 1),
    days: WeekdayEnum.array(),
    /**
     * Location is an array because some classes have multiple locations.
     * This is especially common for lab classes.
     */
    locations: z.string().array(),
});
export type Schedule = z.infer<typeof Schedule>;

export const Course = z.object({
    code: CourseCode,
    title: z.string(),
    description: z.string(),
    primaryAssociation: SchoolEnum,
    potentialError: z.boolean(),
});
export type Course = z.infer<typeof Course>;

export const Instructor = z.object({
    name: z.string(),
});
export type Instructor = z.infer<typeof Instructor>;

export const Section = z.object({
    identifier: SectionIdentifier,
    courseAreas: z.string().array(),
    // credit as in the campus it was taught, normally 0 to 1 for non-hmc
    // and 1-3 for hmc courses. The highest observed is BIOL 195 HM with 6 credits.
    credits: z.number().min(0).max(10),
    permCount: z.number().nonnegative(),
    seatsTotal: z.number().nonnegative(),
    seatsFilled: z.number().nonnegative(),
    status: SectionStatusEnum,
    startDate: CourseDate,
    endDate: CourseDate,
    instructors: Instructor.array(),
    course: Course,
    schedules: Schedule.array(),
    // used to flag whether a parsing error has occurred. we rather let the users
    // know that some data might not be reliable than them finding out the hard way
    potentialError: z.boolean(),
});
export type Section = z.infer<typeof Section>;
