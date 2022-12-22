/*
 * parser for permcount_1.csv
 */

import { parse } from "./parser";

export function parsePermCount(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                codeWithTerm: "permCountExternalId",
                permCount: "PermCount",
            },
        },
        data,
    );
}
