/*
 * parser for coursesection_1.csv
 */
import { parse } from "./parser";

export function parseCourseSection(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                codeWithTerm: "externalId",
                code: "courseExternalId",
                sectionNumber: "coureSectionNumber",
                seatsTotal: "capacity",
                seatsFilled: "currentEnrollment",
                status: "Status",
                credits: "CreditHours",
            },
        },
        data,
    );
}
