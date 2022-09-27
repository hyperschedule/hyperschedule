/**
 * This module includes the type definitions for everything from APIv4.
 * While almost all types are aliased, we can always copy-paste
 * the original definitions here if we need to change the imported type. However,
 * we aren't sure if that's gonna happen so this avoids code duplication while being
 * compatible with future APIs.
 * @module
 */
import * as Courses from "../../types";

export type Instructor = Omit<Courses.Instructor, "email">;
export type Course = Omit<
    Courses.Course,
    "requisite" | "textbooks" | "instructors"
> & {
    instructors: Instructor[];
};
export type Schedule = Courses.Schedule;
export type Location = Courses.Location;
export type CourseIdentifier = Courses.CourseIdentifier;
export type CourseDate = Courses.CourseDate;

// have to this cursed double export because they are enums and
// https://github.com/microsoft/TypeScript/issues/1166
export type School = typeof Courses.School;
export const School = Courses.School;

export type Term = Courses.Term;
export const Term = Courses.Term;

export type Weekday = Courses.Weekday;
export const Weekday = Courses.Weekday;
