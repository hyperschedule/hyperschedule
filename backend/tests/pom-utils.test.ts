import { describe, test, expect } from "@jest/globals";
import { mergeApiCourses, mergeCourseAreaCourses } from "../src/pom-api/utils";
import { CourseWithAreas } from "../src/pom-api/types";

describe("mergeCourseAreaCourses", () => {
    test("Empty course array", () => {
        const result = mergeCourseAreaCourses([
            {
                area: "A",
                courses: [],
            },
        ]);
        expect(result).toEqual(new Map());
    });

    test("One course", () => {
        const result = mergeCourseAreaCourses([
            {
                area: "A",
                courses: [
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST001  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "0.50",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle:
                            "Pass/No Credit Option (Grading Not Allowed: Letter Grade)",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                        ],
                        Name: "Test Course-Disregard    ",
                        Note: "<br>Instructor PERM required  ",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                    },
                ],
            },
        ]);
        expect(result).toEqual(
            new Map<string, CourseWithAreas>([
                [
                    "TEST001  PZ-01",
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST001  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "0.50",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle:
                            "Pass/No Credit Option (Grading Not Allowed: Letter Grade)",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                        ],
                        Name: "Test Course-Disregard    ",
                        Note: "<br>Instructor PERM required  ",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                        courseAreas: ["A"],
                    },
                ],
            ]),
        );
    });

    test("Merge duplicate course and areas", () => {
        const result = mergeCourseAreaCourses([
            {
                area: "A",
                courses: [
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST001  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "0.50",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle:
                            "Pass/No Credit Option (Grading Not Allowed: Letter Grade)",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                        ],
                        Name: "Test Course-Disregard    ",
                        Note: "<br>Instructor PERM required  ",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                    },

                    {
                        Catalog: "UG22",
                        CourseCode: "TEST002  SC-01",
                        CourseStatus:
                            "Reopened<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "1.00",
                        Department: "SREG",
                        Description: "",
                        GradingStyle: "Letter Grade",
                        Instructors: [
                            {
                                CxID: 20264675,
                                EmailAddress: "carakawa@scrippscollege.edu",
                                Name: "Arakawa, Casey",
                            },
                        ],
                        Name: "DNR: All Restrictions Cleared    ",
                        Note: "",
                        PermCount: null,
                        PrimaryAssociation: "SC",
                        Requisites: "N",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: " Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                    },
                ],
            },
            {
                area: "B",
                courses: [
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST001  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "0.50",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle:
                            "Pass/No Credit Option (Grading Not Allowed: Letter Grade)",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                        ],
                        Name: "Test Course-Disregard    ",
                        Note: "<br>Instructor PERM required  ",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                    },
                ],
            },
        ]);
        expect(result).toEqual(
            new Map<string, CourseWithAreas>([
                [
                    "TEST001  PZ-01",
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST001  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "0.50",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle:
                            "Pass/No Credit Option (Grading Not Allowed: Letter Grade)",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                        ],
                        Name: "Test Course-Disregard    ",
                        Note: "<br>Instructor PERM required  ",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                        courseAreas: ["A", "B"],
                    },
                ],
                [
                    "TEST002  SC-01",
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST002  SC-01",
                        CourseStatus:
                            "Reopened<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "1.00",
                        Department: "SREG",
                        Description: "",
                        GradingStyle: "Letter Grade",
                        Instructors: [
                            {
                                CxID: 20264675,
                                EmailAddress: "carakawa@scrippscollege.edu",
                                Name: "Arakawa, Casey",
                            },
                        ],
                        Name: "DNR: All Restrictions Cleared    ",
                        Note: "",
                        PermCount: null,
                        PrimaryAssociation: "SC",
                        Requisites: "N",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: " Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                        courseAreas: ["A"],
                    },
                ],
            ]),
        );
    });
});

describe("mergeApiCourses", () => {
    test("Normal situation", () => {
        const result = mergeApiCourses(
            [
                {
                    Catalog: null,
                    CourseCode: "TEST002  PZ-01",
                    CourseStatus: null,
                    Credits: null,
                    Department: null,
                    Description: null,
                    GradingStyle: null,
                    Instructors: null,
                    Name: null,
                    Note: null,
                    PermCount: "1",
                    PrimaryAssociation: null,
                    Requisites: null,
                    Schedules: null,
                    SeatsFilled: "2",
                    SeatsTotal: "3",
                    Session: null,
                    SubSession: null,
                    Year: null,
                },
            ],
            new Map([
                [
                    "TEST002  PZ-01",
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST002  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "1.00",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle: "Letter Grade",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                            {
                                CxID: 50010831,
                                EmailAddress: "cheryl_morales@pitzer.edu",
                                Name: "Morales, Cheryl",
                            },
                        ],
                        Name: "Test Course--Disregard    ",
                        Note: "",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                        courseAreas: ["A"],
                    },
                ],
            ]),
        );
        expect(result).toEqual([
            {
                Catalog: "UG22",
                CourseCode: "TEST002  PZ-01",
                CourseStatus:
                    "Open<p><b>Changed section</b><p><b>Added section</b>",
                Credits: "1.00",
                Department: "ZREG",
                Description: "",
                GradingStyle: "Letter Grade",
                Instructors: [
                    {
                        CxID: 50092605,
                        EmailAddress: null,
                        Name: "Poppins, Mary",
                    },
                    {
                        CxID: 50010831,
                        EmailAddress: "cheryl_morales@pitzer.edu",
                        Name: "Morales, Cheryl",
                    },
                ],
                Name: "Test Course--Disregard    ",
                Note: "",
                PermCount: 1,
                PrimaryAssociation: "PZ",
                Requisites: "Y",
                Schedules: [
                    {
                        Building: "",
                        BuildingCode: null,
                        Campus: "PZ Campus",
                        MeetTime: "To Be Arranged   ",
                        Room: " ",
                        Weekdays: "",
                    },
                    {
                        Building: "",
                        BuildingCode: null,
                        Campus: "PZ Campus",
                        MeetTime: "To Be Arranged   ",
                        Room: " ",
                        Weekdays: "",
                    },
                ],
                SeatsFilled: 2,
                SeatsTotal: 3,
                Session: "FA",
                SubSession: "",
                Year: "2022",
                courseAreas: ["A"],
            },
        ]);
    });
    test("Missing termCourse", () => {
        const result = mergeApiCourses(
            [],
            new Map([
                [
                    "TEST002  PZ-01",
                    {
                        Catalog: "UG22",
                        CourseCode: "TEST002  PZ-01",
                        CourseStatus:
                            "Open<p><b>Changed section</b><p><b>Added section</b>",
                        Credits: "1.00",
                        Department: "ZREG",
                        Description: "",
                        GradingStyle: "Letter Grade",
                        Instructors: [
                            {
                                CxID: 50092605,
                                EmailAddress: null,
                                Name: "Poppins, Mary",
                            },
                            {
                                CxID: 50010831,
                                EmailAddress: "cheryl_morales@pitzer.edu",
                                Name: "Morales, Cheryl",
                            },
                        ],
                        Name: "Test Course--Disregard    ",
                        Note: "",
                        PermCount: null,
                        PrimaryAssociation: "PZ",
                        Requisites: "Y",
                        Schedules: [
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                            {
                                Building: "",
                                BuildingCode: null,
                                Campus: "PZ Campus",
                                MeetTime: "To Be Arranged   ",
                                Room: " ",
                                Weekdays: "",
                            },
                        ],
                        SeatsFilled: null,
                        SeatsTotal: null,
                        Session: "FA",
                        SubSession: "",
                        Year: "2022",
                        courseAreas: ["A"],
                    },
                ],
            ]),
        );
        expect(result).toEqual([
            {
                Catalog: "UG22",
                CourseCode: "TEST002  PZ-01",
                CourseStatus:
                    "Open<p><b>Changed section</b><p><b>Added section</b>",
                Credits: "1.00",
                Department: "ZREG",
                Description: "",
                GradingStyle: "Letter Grade",
                Instructors: [
                    {
                        CxID: 50092605,
                        EmailAddress: null,
                        Name: "Poppins, Mary",
                    },
                    {
                        CxID: 50010831,
                        EmailAddress: "cheryl_morales@pitzer.edu",
                        Name: "Morales, Cheryl",
                    },
                ],
                Name: "Test Course--Disregard    ",
                Note: "",
                PermCount: NaN,
                PrimaryAssociation: "PZ",
                Requisites: "Y",
                Schedules: [
                    {
                        Building: "",
                        BuildingCode: null,
                        Campus: "PZ Campus",
                        MeetTime: "To Be Arranged   ",
                        Room: " ",
                        Weekdays: "",
                    },
                    {
                        Building: "",
                        BuildingCode: null,
                        Campus: "PZ Campus",
                        MeetTime: "To Be Arranged   ",
                        Room: " ",
                        Weekdays: "",
                    },
                ],
                SeatsFilled: NaN,
                SeatsTotal: NaN,
                Session: "FA",
                SubSession: "",
                Year: "2022",
                courseAreas: ["A"],
            },
        ]);
    });
});
