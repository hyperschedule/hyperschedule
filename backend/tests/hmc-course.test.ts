import { describe, test, expect } from "@jest/globals";
import type * as APIv4 from "hyperschedule-shared/api/v4";

import { linkCourseData } from "../src/hmc-api/course";
import * as fs from "fs/promises";

const PARSED_SAMPLE_PATH = "src/hmc-api/sample/parsed-sample-v4.json";

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

        const result = linkCourseData(Object.fromEntries(files));

        const expected = JSON.parse(
            await fs.readFile(PARSED_SAMPLE_PATH, { encoding: "utf-8" }),
        );

        expect(result).toStrictEqual(expected);
    }, 2000);
});
