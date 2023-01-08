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
    // this is the last two letters of the course code, e.g. SC, HM, JT, AS, AF
    affiliation: string;
}

/** CourseIdentifier is the unique identifier we need to pinpoint a course offering
 * from the database. We may stringify it as something like
 * `TEST001 SC-05 2022/FA`.
 */
export interface SectionIdentifier extends CourseCode {
    sectionNumber: number;
    year: number;
    term: Term;
}

export interface Course {
    code: CourseCode;
    title: string;
    description: string;
    primaryAssociation: School;
}

export interface Section {
    identifier: SectionIdentifier;
    course: Course;
}
