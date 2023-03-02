import type * as APIv4 from "hyperschedule-shared/api/v4";
import * as APIv3 from "hyperschedule-shared/api/v3";

export const testSectionV4: APIv4.Section = {
    course: {
        title: "Programming Languages",
        description:
            "A thorough examination of issues and features in language design and implementation including language-provided data structuring and data-typing, modularity, scoping, inheritance and concurrency. Compilation and run-time issues. Introduction to formal semantics. Prerequisite: Computer Science 70 and 81.",
        primaryAssociation: "HM",
        code: {
            department: "CSCI",
            courseNumber: 131,
            suffix: "",
            affiliation: "HM",
        },
        potentialError: false,
    },
    status: "R",
    credits: 3,
    courseAreas: [],
    instructors: [
        {
            name: "Benjamin Wiedermann",
        },
        {
            name: "Lucas Bang",
        },
    ],
    schedules: [
        {
            startTime: 34500,
            endTime: 39000,
            days: ["M", "W"],
            locations: [
                "McGregor CompSci Center 203",
                "McGregor CompSci Center 204",
                "McGregor CompSci Center 205",
            ],
        },
    ],
    identifier: {
        department: "CSCI",
        courseNumber: 131,
        suffix: "",
        affiliation: "HM",
        sectionNumber: 1,
        term: "SP",
        year: 2023,
        half: null,
    },
    seatsTotal: 30,
    seatsFilled: 28,
    potentialError: false,
    permCount: 4,
    startDate: {
        year: 2023,
        month: 1,
        day: 17,
    },
    endDate: {
        year: 2023,
        month: 5,
        day: 12,
    },
} as APIv4.Section;

export const testSectionV3: APIv3.Course = {
    courseCode: "CSCI 131 HM-01",
    courseName: "Programming Languages",
    courseSortKey: ["CSCI 131 HM-01"],
    courseMutualExclusionKey: ["CSCI 131 HM"],
    courseDescription:
        "A thorough examination of issues and features in language design and implementation including language-provided data structuring and data-typing, modularity, scoping, inheritance and concurrency. Compilation and run-time issues. Introduction to formal semantics. Prerequisite: Computer Science 70 and 81.",
    courseInstructors: ["Benjamin Wiedermann", "Lucas Bang"],
    courseTerm: "SP2023",
    courseSchedule: [
        {
            scheduleDays: "MW",
            scheduleStartTime: "09:35",
            scheduleEndTime: "10:50",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 203",
        },
        {
            scheduleDays: "MW",
            scheduleStartTime: "09:35",
            scheduleEndTime: "10:50",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 204",
        },
        {
            scheduleDays: "MW",
            scheduleStartTime: "09:35",
            scheduleEndTime: "10:50",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 205",
        },
    ],
    courseCredits: 3,
    courseSeatsTotal: 30,
    courseSeatsFilled: 28,
    courseWaitlistLength: null,
    courseEnrollmentStatus: APIv3.EnrollmentStatus.reopened,
    permCount: 4,
};
