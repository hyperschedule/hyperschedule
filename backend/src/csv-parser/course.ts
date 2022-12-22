/*
 * parser for course_1.csv
 */
import { parse } from "./parser";

export function parseCourse(data: string) {
    const result = parse(
        {
            hasHeader: true,
            separator: "||`||",
            fields: {
                code: "externalId",
                title: "courseTitle",
                campus: "institutionExternalId",
                description: "description",
            },
        },
        data,
    );
    if (result.ok) {
        for (let r of result.records) {
            r.description = r.description.replaceAll("||``||", "\n");
        }
        for (let w of result.warnings) {
            console.warn(w);
        }
    } else {
        console.error(result.missingColumns);
        throw Error(
            "Cannot parse course, missing columns " +
                JSON.stringify(result.missingColumns),
        );
    }

    return result.records;
}
