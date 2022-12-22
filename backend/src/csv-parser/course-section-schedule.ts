/*
 * parser for coursesectionschedule_1.csv
 */

import { parse } from "./parser";

export function parseCourseSectionSchedule(data: string) {
    return parse(
        {
            hasHeader: true,
            separator: ",",
            fields: {
                externalId: "externalId",
                codeWithTerm: "courseSectionExternalId",
                beginTime: "classBeginningTime",
                endTime: "classEndingTime",
                meetingDays: "classMeetingDays",
                location: "InstructionSiteName",
                locationType: "InstructionSiteType",
            },
        },
        data,
    );
}
