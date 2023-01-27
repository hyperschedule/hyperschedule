import type * as APIv4 from "hyperschedule-shared/api/v4";

export const testSection: APIv4.Section = {
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
            name: "Wiedermann, Benjamin",
        },
        {
            name: "Bang, Lucas",
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
        half: "",
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
