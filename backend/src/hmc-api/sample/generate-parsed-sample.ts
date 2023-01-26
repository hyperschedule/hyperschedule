import { linkCourseData } from "../course";
import * as fs from "fs";

const PARSED_SAMPLE_PATH = "src/hmc-api/sample/parsed-sample-v4.json";

let f = JSON.stringify(
    linkCourseData(
        //@ts-ignore
        {
            ...Object.fromEntries(
                (
                    [
                        "altstaff",
                        "calendarSession",
                        "calendarSessionSection",
                        "course",
                        "courseSection",
                        "courseSectionSchedule",
                        "permCount",
                        "sectionInstructor",
                        "staff",
                    ] as const
                ).map((name) => [
                    name,
                    fs.readFileSync(
                        `src/hmc-api/sample/${name.toLowerCase()}_1.csv`,
                        {
                            encoding: "utf-8",
                        },
                    ),
                ]),
            ),
            courseAreas: fs.readFileSync(
                "src/hmc-api/sample/course_area.json",
                { encoding: "utf-8" },
            ),
        },
    ),
    null,
    2,
);

fs.writeFileSync(PARSED_SAMPLE_PATH, f);
