import type { Requisite } from "./requisite";

export type School = "POM" | "HMC" | "PTZ" | "CMC" | "SCR" | "KGI" | "CGU";
export type Term = "FA" | "SU" | "SP";
export type Weekday =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export type CourseDate = {
    year: number;
    month: number;
    day: number;
};

// CourseIdentifier is the unique identifier we need to pinpoint a course
// from the database. We may stringify it as something like
// {courseCode} {school}-{sectionNumber} {year}/{term}
// E.g. "TEST001 HMC-05 2022/FA"
export type CourseIdentifier = {
    courseCode: string;
    sectionNumber: number;
    year: number;
    term: Term;
    school: School;
};

export type Course = {
    identifier: CourseIdentifier;

    title: string;
    description: string;

    credits: number;
    permCount: number;

    seatsTotal: number;
    // seats available will be capped at 0. No negative seats
    seatsAvailable: number;
    seatsTaken: number;

    schedules: Schedule[];

    startDate: CourseDate;
    endDate: CourseDate;

    notes: string;
    textbooks: string[];

    instructors: Instructor[];

    requisite: Requisite;
};

export type Schedule = {
    // seconds since midnight
    startTime: number;
    endTime: number;

    days: Weekday[];
    // some classes (e.g. labs) have multiple classrooms
    locations: Location[];
};

export type Location = {
    buildingName: string;
    school: School;
    roomName: string;
};

export type Instructor = {
    name: string;
    email: string;
};
