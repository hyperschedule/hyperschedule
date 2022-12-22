/*
 * parser for staff_1.csv
 */

import { parse } from "./parser";

export function parseStaff(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                cxId: "ExternalId",
                firstname: "firstName",
                lastname: "lastName",
            },
        },
        data,
    );
}
