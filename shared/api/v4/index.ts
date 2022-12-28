/**
 * This module includes the type definitions for everything from APIv4.
 * While almost all types are aliased, we can always copy-paste
 * the original definitions here if we need to change the imported type. However,
 * we aren't sure if that's gonna happen so this avoids code duplication while being
 * compatible with future APIs.
 * @module
 */
import * as Courses from "../../types";

export type Schedule = Omit<Courses.Schedule, "locations"> & {
    locations: string[];
};
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
    // the campus the course is associated with.
    primaryAssociation: School;
}

export type Instructor = Omit<Courses.Instructor, "email">;
export type Section = Omit<
    Courses.Course,
    | "requisite"
    | "textbooks"
    | "instructors"
    | "title"
    | "description"
    | "primaryAssociation"
    | "schedules"
> & {
    instructors: Instructor[];
    course: Course;
    schedules: Schedule[];
    // used to flag whether a parsing error has occurred. we rather let the users
    // know that some data might not be reliable than them finding out the hard way
    potentialError: boolean;
};
