import { test, describe, expect } from "@jest/globals";
import * as APIv4 from "hyperschedule-shared/api/v4";
import * as APIv3 from "hyperschedule-shared/api/v3";

import { v3CourseFromV4Section } from "../src/hmc-api/v3compat";

function compareV3Schedules(x: APIv3.Schedule, y: APIv3.Schedule): number {
    return JSON.stringify(x).localeCompare(JSON.stringify(y));
}

const v4Section: APIv4.Section = APIv4.Section.parse({
    course: {
        title: "Computer Systems",
        description:
            "An introduction to computer systems. In particular the course investigates data representations, machine level representations of programs, processor architecture, program optimizations, the memory hierarchy, linking, exceptional control flow (exceptions, interrupts, processes and Unix signals), performance measurement, virtual memory, system-level I/O and basic concurrent programming. These concepts are supported by a series of hands-on lab assignments. Prerequisite: Computer Science 70.",
        primaryAssociation: "HM",
        code: {
            department: "CSCI",
            courseNumber: 105,
            suffix: "",
            affiliation: "HM",
        },
        potentialError: false,
    },
    status: "R",
    credits: 3,
    courseAreas: ["1A5", "CSCI"],
    instructors: [
        {
            name: "Geoffrey Kuenning",
        },
    ],
    schedules: [
        {
            startTime: 47700,
            endTime: 52200,
            days: ["T", "R"],
            locations: ["Beckman Hall B126"],
        },
        {
            startTime: 47700,
            endTime: 52200,
            days: ["F"],
            locations: [
                "McGregor CompSci Center 203",
                "McGregor CompSci Center 204",
                "McGregor CompSci Center 205",
            ],
        },
    ],
    identifier: {
        department: "CSCI",
        courseNumber: 105,
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
    permCount: 2,
});

const v3Course: APIv3.Course = APIv3.Course.parse({
    courseCode: "CSCI 105 HM-01",
    courseName: "Computer Systems",
    courseSortKey: ["CSCI 105 HM-01"],
    courseMutualExclusionKey: ["CSCI 105 HM"],
    courseDescription:
        "An introduction to computer systems. In particular the course investigates data representations, machine level representations of programs, processor architecture, program optimizations, the memory hierarchy, linking, exceptional control flow (exceptions, interrupts, processes and Unix signals), performance measurement, virtual memory, system-level I/O and basic concurrent programming. These concepts are supported by a series of hands-on lab assignments. Prerequisite: Computer Science 70.",
    courseInstructors: ["Geoffrey Kuenning"],
    courseTerm: "SP2023",
    courseSchedule: [
        {
            scheduleDays: "F",
            scheduleStartTime: "13:15",
            scheduleEndTime: "14:30",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 203",
        },
        {
            scheduleDays: "F",
            scheduleStartTime: "13:15",
            scheduleEndTime: "14:30",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 204",
        },
        {
            scheduleDays: "F",
            scheduleStartTime: "13:15",
            scheduleEndTime: "14:30",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "McGregor CompSci Center 205",
        },
        {
            scheduleDays: "TR",
            scheduleStartTime: "13:15",
            scheduleEndTime: "14:30",
            scheduleStartDate: "2023-01-17",
            scheduleEndDate: "2023-05-12",
            scheduleTermCount: 1,
            scheduleTerms: [0],
            scheduleLocation: "Beckman Hall B126",
        },
    ].sort(compareV3Schedules),
    courseCredits: 3,
    courseSeatsTotal: 30,
    courseSeatsFilled: 28,
    courseWaitlistLength: null,
    courseEnrollmentStatus: "reopened",
    permCount: 2,
});

describe("APIv3 backwards compatibility", () => {
    test("Convert v4 section to v3 course", () => {
        const convertedCourse = v3CourseFromV4Section(v4Section);
        convertedCourse.courseSchedule.sort(compareV3Schedules);
        expect(v3Course).toStrictEqual(convertedCourse);
        APIv3.Course.parse(convertedCourse);
    });
});
