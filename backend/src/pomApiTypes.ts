/**
 *ref: https://jicsweb.pomona.edu/Help/Api/GET-api-Terms
 */
export interface PomApiTerm {
    Description: string;
    Key: string;
    Session: string;
    Subsession: string;
    Year: string;
}

/**
 * ref: https://jicsweb.pomona.edu/Help/Api/GET-api-CourseAreas
 */
export interface PomApiCourseArea {
    Code: string;
    Description: string;
}

/**
 * ref: https://jicsweb.pomona.edu/Help/Api/GET-api-Courses-termKey-courseArea
 *
 * @remark
 * Example course from API
 *
 * ```ts
 *     {
 *         "Catalog": "UG22",
 *         "CourseCode": "CSCI042  HM-01",
 *         "CourseStatus": "Closed (Full)",
 *         "Credits": "3.00",
 *         "Department": "HCSI",
 *         "Description": "Accelerated breadth-first introduction to computer science as a discipline for students (usually first-year) who have a strong programming background. Computational models of functional, object-oriented and logic programming. Data structures and algorithm analysis. Computer logic and architecture. Grammars and pars-ing. Regular expressions. Computability. Extensive practice constructing applications from principles, using a variety of languages. Successful completion of this course satisfies the Computer Science 5 Core requirement and Computer Science 60 coursework. Prerequisite: permission of instructor. \n",
 *         "GradingStyle": "Freshman Course",
 *         "Instructors": [
 *             {
 *                 "CxID": 40156281,
 *                 "EmailAddress": null,
 *                 "Name": "Wiedermann, Benjamin"
 *             }
 *         ],
 *         "Name": "Principles & Practice: Comp Sci    ",
 *         "Note": "",
 *         "PermCount": null,
 *         "PrimaryAssociation": "HM",
 *         "Requisites": "Y",
 *         "Schedules": [
 *             {
 *                 "Building": "Shanahan Center",
 *                 "BuildingCode": null,
 *                 "Campus": "HM Campus",
 *                 "MeetTime": "09:35-10:50AM.  SHAN Room 2475 (Shanahan Center)",
 *                 "Room": "40-seat classroom/W52 ",
 *                 "Weekdays": "TR"
 *             }
 *         ],
 *         "SeatsFilled": null,
 *         "SeatsTotal": null,
 *         "Session": "FA",
 *         "SubSession": "",
 *         "Year": "2022"
 *     },
 * ```
 */
export interface PomApiCourseAreaCourse {
    Catalog: string;
    CourseCode: string;
    CourseStatus: string;
    Credits: string;
    Department: string;
    Description: string;
    GradingStyle: string;
    Instructors: {
        EmailAddress: string;
        Name: string;
        CxID: number;
    }[];
    Name: string;
    Note: string;
    PermCount: null;
    PrimaryAssociation: string;
    Requisites: string;
    Schedules: {
        BuildingCode: null;
        Building: string;
        Campus: string;
        MeetTime: string;
        Room: string;
        Weekdays: string;
    }[];
    SeatsFilled: string;
    SeatsTotal: string;
    Session: string;
    SubSession: string;
    Year: string;
}

/**
 * ref: https://jicsweb.pomona.edu/Help/Api/GET-api-Courses-termKey
 *
 * @remark
 * Example course from API
 *
 * ```ts
 *     {
 *         "Catalog": null,
 *         "CourseCode": "XGOV191  CM-07",
 *         "CourseStatus": null,
 *         "Credits": null,
 *         "Department": null,
 *         "Description": null,
 *         "GradingStyle": null,
 *         "Instructors": null,
 *         "Name": null,
 *         "Note": null,
 *         "PermCount": null,
 *         "PrimaryAssociation": null,
 *         "Requisites": null,
 *         "Schedules": null,
 *         "SeatsFilled": "0",
 *         "SeatsTotal": "5",
 *         "Session": null,
 *         "SubSession": null,
 *         "Year": null
 *     }
 * ```
 */
export interface PomApiTermCourse {
    CourseCode: string;
    PermCount: string | null;
    SeatsFilled: string;
    SeatsTotal: string;

    Catalog: null;
    CourseStatus: null;
    Credits: null;
    Department: null;
    Description: null;
    GradingStyle: null;
    Instructors: null;
    Name: null;
    Note: null;
    PrimaryAssociation: null;
    Requisites: null;
    Schedules: null;
    Session: null;
    SubSession: null;
    Year: null;
}

export interface CourseWithAreas extends PomApiCourseAreaCourse {
    courseAreas: string[];
}

export interface MergedPomApiCourse
    extends Omit<CourseWithAreas, "PermCount" | "SeatsFilled" | "SeatsTotal"> {
    PermCount: number;
    SeatsFilled: number;
    SeatsTotal: number;
}
