import { describe, expect, test } from "@jest/globals";
import { linkCourseData } from "../../src/hmc-api/data-linker";
import { HmcApiFiles } from "../../src/hmc-api/fetcher/types";
import { Term } from "hyperschedule-shared/api/v4";

const testData: HmcApiFiles = {
    altstaff: "[]",
    calendarSession: JSON.stringify([
        {
            externalId: "SP2023",
            beginDate: "20230117",
            endDate: "20230512",
        },
        {
            externalId: "SP2023P1",
            beginDate: "20230117",
            endDate: "20230303",
        },
    ]),
    calendarSessionSection: JSON.stringify([
        {
            calendarSessionExternalId: "SP2023",
            courseSectionId: "CSCI105  HM-01 SP2023",
        },
        {
            calendarSessionExternalId: "SP2023P1",
            courseSectionId: "ENGR085A HM-01 SP2023P1",
        },
    ]),
    courseRaw:
        "DBSTART|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|BEGIN|2|@|OUT_START|3|@|CSCI105  HM|^|Computer Systems|^|HCSI|^||^|HM|^|Description for CS105\n" +
        "|#|ENGR085A HM|^|Digital Electronics|^|HEGR|^||^|HM|^|Description for E85A|#||#|OUT_END|3|@|END|2|@|DBEND|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|",
    courseSection: JSON.stringify([
        {
            courseSectionId: "CSCI105  HM-01 SP2023",
            courseSectionNumber: "01",
            capacity: "30",
            currentEnrollment: "26",
            status: "R",
            creditHours: "3.0",
        },
        {
            courseSectionId: "ENGR085A HM-01 SP2023P1",
            courseSectionNumber: "01",
            capacity: "11",
            currentEnrollment: "8",
            status: "R",
            creditHours: "1.5",
        },
    ]),
    courseSectionSchedule: JSON.stringify([
        {
            courseSectionId: "CSCI105  HM-01 SP2023",
            classBeginningTime: "1315",
            classEndingTime: "1430",
            classMeetingDays: "--T-R--",
            instructionSiteName: "HM BK B126",
        },
        {
            courseSectionId: "ENGR085A HM-01 SP2023P1",
            classBeginningTime: "810",
            classEndingTime: "935",
            classMeetingDays: "-M-W---",
            instructionSiteName: "HM SHAN B460",
        },
    ]),
    permCount: JSON.stringify([
        {
            courseSectionId: "ENGR085A HM-01 SP2023P1",
            permCount: "2",
        },
    ]),
    sectionInstructor: JSON.stringify([
        {
            courseSectionId: "CSCI105  HM-01 SP2023",
            staffExternalIds: ["40000000"],
        },
        {
            courseSectionId: "ENGR085A HM-01 SP2023P1",
            staffExternalIds: ["40000001"],
        },
    ]),
    staff: JSON.stringify([
        {
            cxId: "40000000",
            firstName: "First",
            lastName: "Test",
        },
        {
            cxId: "40000001",
            firstName: "Test",
            lastName: "Second",
        },
    ]),
    courseAreas: JSON.stringify([
        {
            course_code: "CSCI105  HM",
            catalog: "UG22",
            course_areas: ["1A5", "CSCI"],
        },
        {
            course_code: "ENGR085A HM",
            catalog: "UG22",
            course_areas: ["ENGR"],
        },
    ]),
    courseAreaDescription: JSON.stringify([
        {
            area: "1A5",
            description: "PO Area 5 Requirement",
        },
        {
            area: "CSCI",
            description: "Computer Science",
        },
        {
            area: "ENGR",
            description: "Engineering",
        },
    ]),
};

describe("src/hmc-api/data-linker.ts", () => {
    test("data integrity", () => {
        const data = linkCourseData(testData, {
            term: Term.spring,
            year: 2023,
        });
        expect(data).toStrictEqual([
            {
                course: {
                    title: "Computer Systems",
                    description: "Description for CS105\n",
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
                courseAreas: ["1A5", "CSCI"],
                potentialError: false,
                instructors: [{ name: "First Test" }],
                schedules: [
                    {
                        startTime: 47700,
                        endTime: 52200,
                        days: ["T", "R"],
                        locations: ["Beckman Hall B126"],
                    },
                ],
                credits: 3,
                identifier: {
                    department: "CSCI",
                    courseNumber: 105,
                    suffix: "",
                    affiliation: "HM",
                    sectionNumber: 1,
                    year: 2023,
                    term: "SP",
                    half: null,
                },
                seatsTotal: 30,
                seatsFilled: 26,
                startDate: { year: 2023, month: 1, day: 17 },
                endDate: { year: 2023, month: 5, day: 12 },
                permCount: 0,
            },
            {
                course: {
                    title: "Digital Electronics",
                    description: "Description for E85A",
                    primaryAssociation: "HM",
                    code: {
                        department: "ENGR",
                        courseNumber: 85,
                        suffix: "A",
                        affiliation: "HM",
                    },
                    potentialError: false,
                },
                status: "R",
                courseAreas: ["ENGR"],
                potentialError: false,
                instructors: [{ name: "Test Second" }],
                schedules: [
                    {
                        startTime: 29400,
                        endTime: 34500,
                        days: ["M", "W"],
                        locations: ["Shanahan Center B460"],
                    },
                ],
                credits: 1.5,
                identifier: {
                    department: "ENGR",
                    courseNumber: 85,
                    suffix: "A",
                    affiliation: "HM",
                    sectionNumber: 1,
                    year: 2023,
                    term: "SP",
                    half: { prefix: "P", number: 1 },
                },
                seatsTotal: 11,
                seatsFilled: 8,
                startDate: { year: 2023, month: 1, day: 17 },
                endDate: { year: 2023, month: 3, day: 3 },
                permCount: 2,
            },
        ]);
    });

    test("term filter", () => {
        expect(
            linkCourseData(testData, { term: Term.fall, year: 2023 }),
        ).toStrictEqual([]);

        expect(
            linkCourseData(testData, { term: Term.fall, year: 2022 }),
        ).toStrictEqual([]);
    });
});
