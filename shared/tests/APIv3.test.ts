import * as APIv4 from "../api/v4";
import * as APIv3 from "../api/v3";

import { describe, test } from "@jest/globals";

const v3Course: APIv3.Course = {
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
    ],
    courseCredits: 3,
    courseSeatsTotal: 30,
    courseSeatsFilled: 28,
    courseWaitlistLength: null,
    courseEnrollmentStatus: "reopened" as APIv3.EnrollmentStatus,
    permCount: 2,
};

describe("APIv3", () => {
    test("Instantiate course", () => {
        APIv3.Course.parse(v3Course);
    });
});
