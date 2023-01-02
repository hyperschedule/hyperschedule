/**
 * This module includes the type definitions for everything from APIv4.
 * While almost all types are aliased, we can always copy-paste
 * the original definitions here if we need to change the imported type. However,
 * we aren't sure if that's gonna happen so this avoids code duplication while being
 * compatible with future APIs.
 * @module
 */
import * as Courses from "../../types";
// type alias for schema generation
type integer = number;
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

export type SectionIdentifier = Courses.SectionIdentifier;
export type CourseDate = Courses.CourseDate;
export type CourseCode = Courses.CourseCode;

// have to this cursed double export because they are enums and
// https://github.com/microsoft/TypeScript/issues/1166
export type School = Courses.School;
export const School = Courses.School;

export type Term = Courses.Term;
export const Term = Courses.Term;

export type Weekday = Courses.Weekday;
export const Weekday = Courses.Weekday;

export type SectionStatus = Courses.SectionStatus;
export const SectionStatus = Courses.SectionStatus;

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

export * from "./course-code";
