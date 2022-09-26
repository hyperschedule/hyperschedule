import {
    Course as _Course,
    CourseIdentifier as _CourseIdentifier,
    CourseDate as _CourseDate,
    Instructor as _Instructor,
    Schedule as _Schedule,
    Location as _Location,
    School as _School,
    Term as _Term,
    Weekday as _Weekday,
} from "courses/course";

/*
While currently everything in this namespace is aliased, we can always copy-paste
the original definitions here if we need to change the imported type. However,
we aren't sure if that's gonna happen so this avoids code duplication while being
compatible with future APIs
 */
namespace APIv4 {
    export type Instructor = Omit<_Instructor, "email">;
    export type Course = Omit<
        _Course,
        "requisite" | "textbooks" | "instructors"
    > & {
        instructors: Instructor[];
    };
    export type Schedule = _Schedule;
    export type Location = _Location;
    export type School = _School;
    export type Term = _Term;
    export type Weekday = _Weekday;
    export type CourseIdentifier = _CourseIdentifier;
    export type CourseDate = _CourseDate;
}

export type { APIv4 };
