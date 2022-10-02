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
 */
export interface PomApiCourse {
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
        CxID: string;
    }[];
    Name: string;
    Note: string;
    PermCount: string;
    PrimaryAssociation: string;
    Requisites: string;
    Schedules: {
        BuildingCode: string;
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
