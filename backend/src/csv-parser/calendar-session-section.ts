/*
 * parser for calendarsessionsection_1.csv
 */
import { parse } from "./parser";

export function parseCalendarSessionSection(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                term: "calendarSessionExternalId",
                codeWithTerm: "courseSectionExternalId",
            },
        },
        data,
    );
}
