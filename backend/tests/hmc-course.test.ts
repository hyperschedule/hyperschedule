import { describe, test, expect } from "@jest/globals";
import type * as APIv4 from "hyperschedule-shared/api/v4";

import { linkCourseData, extractSectionTerm } from "../src/hmc-api/course";
import { parseCourseBoomi } from "../src/hmc-api/files";
import * as fs from "fs/promises";

const PARSED_SAMPLE_PATH = "src/hmc-api/sample/parsed-sample-v4.json";

const BOOMI_DB_SAMPLE = `
DBSTART|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|BEGIN|2|@|OUT_START|3|@|SMPL010A EX|^|Example Class|^|SAFR|^||^|SC|^|Example Description
|#|SMPL127  EX|^|Another Example Class|^|SAFR|^|05.0201|^|PZ|^|Indeed, another example description
|#|SMPL123  EX|^|Class With Not enough fields|^|PZ|^|this one should be skipped
|#|SMPL124  EX|^|Class With too many fields|^|SAFR|^||^|PZ|^|the next field should be ignored|^|junk|^||^|
|#|SMPL191  EX|^|Example Class Boogaloo|^|PAFR|^||^|PO|^|Yeehaw|#||#|OUT_END|3|@|END|2|@|DBEND|85ba3f56-d039-43dd-ad22-913c0e2b42b8|2|@|
`;
const BOOMI_DB_EXPECTED: ReturnType<typeof parseCourseBoomi> = [
    {
        code: "SMPL010A EX",
        title: "Example Class",
        campus: "SC",
        description: "Example Description\n",
    },
    {
        code: "SMPL127  EX",
        title: "Another Example Class",
        campus: "PZ",
        description: "Indeed, another example description\n",
    },
    // class with not enough fields is skipped
    {
        code: "SMPL124  EX",
        title: "Class With too many fields",
        campus: "PZ",
        description: "the next field should be ignored",
    },
    {
        code: "SMPL191  EX",
        title: "Example Class Boogaloo",
        campus: "PO",
        description: "Yeehaw",
    },
];

describe("src/hmc-api/course.ts", () => {
    test("linkCourseData", async () => {
        const filenames = [
            "altstaff",
            "calendarSession",
            "calendarSessionSection",
            "course",
            "courseSection",
            "courseSectionSchedule",
            "permCount",
            "sectionInstructor",
            "staff",
        ] as const;

        const files = await Promise.all(
            filenames.map(async (fn) => [
                fn,
                await fs.readFile(
                    `src/hmc-api/sample/${fn.toLowerCase()}_1.csv`,
                    {
                        encoding: "utf-8",
                    },
                ),
            ]),
        );

        files.push([
            "courseAreas",
            await fs.readFile("src/hmc-api/sample/course_area.json", {
                encoding: "utf-8",
            }),
        ]);

        const result = linkCourseData(Object.fromEntries(files));

        const expected = JSON.parse(
            await fs.readFile(PARSED_SAMPLE_PATH, { encoding: "utf-8" }),
        );

        expect(result).toStrictEqual(expected);
    }, 2000);

    test("extractSectionTerm", () => {
        expect(
            extractSectionTerm({
                department: "AFRI",
                courseNumber: 10,
                suffix: "A",
                affiliation: "AF",
                sectionNumber: 1,
                term: "SP",
                year: 2023,
                half: null,
            } as APIv4.SectionIdentifier),
        ).toEqual("SP2023");

        expect(
            extractSectionTerm({
                department: "AFRI",
                courseNumber: 10,
                suffix: "A",
                affiliation: "AF",
                sectionNumber: 1,
                term: "SP",
                year: 2023,
                half: {
                    prefix: "P",
                    number: 1,
                },
            } as APIv4.SectionIdentifier),
        ).toEqual("SP2023P1");
    });

    test("parseBoomiEquivalent", () => {
        const boomi_courses = parseCourseBoomi(BOOMI_DB_SAMPLE);
        expect(boomi_courses).toStrictEqual(BOOMI_DB_EXPECTED);
    });
});
