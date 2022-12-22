/*
 * parser for calendarsession_1.csv
 */

import { parse } from "./parser";

export function parseCalendarSession(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                externalID: "externalId",
                term: "designator",
                startDate: "beginDate",
                endDate: "EndDate",
            },
        },
        data,
    );
}
