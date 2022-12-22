/*
 * parser for altstaff_1.csv
 */

import { parse } from "./parser";

export function parseAltStaff(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                cxId: "ExternalId",
                firstname: "firstName",
                lastname: "lastName",
                altName: "altName",
            },
        },
        data,
    );
}
