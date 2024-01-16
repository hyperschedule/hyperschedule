import type { Request, Response } from "@tinyhttp/app";
import { App } from "@tinyhttp/app";
import type * as ics from "ics";
import { createEvents } from "ics";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { createLogger } from "../../logger";
import { getUser } from "../../db/models/user";
import { getAllSections } from "../../db/models/course";

const logger = createLogger("server.route.calendar");

export const calendarApp = new App({ settings: { xPoweredBy: false } });

// generated locally using https://www.npmjs.com/package/@touch4it/ical-timezones
const ICAL_TIMEZONE_HEADER = `X-WR-TIMEZONE:America/Los_Angeles
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
LAST-MODIFIED:20230517T170336Z
BEGIN:DAYLIGHT
TZNAME:PDT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:PST
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;

calendarApp.get(
    "/:userId/:scheduleId",
    async function (request: Request, response: Response) {
        const userId = APIv4.UserId.safeParse(request.params.userId);
        if (!userId.success) {
            logger.info("Error parsing user id %o", request.params.userId);
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(userId.error);
        }
        const scheduleId = APIv4.ScheduleId.safeParse(
            request.params.scheduleId,
        );
        if (!scheduleId.success) {
            logger.info(
                "Error parsing schedule id %o",
                request.params.scheduleId,
            );
            return response
                .status(400)
                .header("Content-Type", "application/json")
                .send(scheduleId.error);
        }

        let user;
        try {
            user = await getUser(userId.data);
        } catch {
            return response
                .status(404)
                .header("Content-Type", "text/plain")
                .send(`user '${userId.data}' does not exist`);
        }
        const schedule = user.schedules[scheduleId.data];
        if (schedule === undefined) {
            return response
                .status(404)
                .header("Content-Type", "text/plain")
                .send(
                    `schedule '${scheduleId.data}' does not exist` +
                        ` for user '${userId.data}'`,
                );
        }

        const calendar = await createCalendar(schedule);
        if ((calendar.error as Error | null) !== null) {
            logger.error("Error creating iCal calendar: %o", calendar.error);
            return response
                .status(500)
                .header("Content-Type", "text/plain")
                .send(`Failure creating valid iCal calendar`);
        }

        // Safety: ics documentation:
        // > If a callback is not provided, [createEvents()] returns an object
        // > having the form { error, value }, where value is an iCal-compliant
        // > text string if error is null.
        // [https://www.npmjs.com/package/ics]
        const patched = calendar
            .value! // ical timezone patching from https://stackoverflow.com/a/58038439/7416363
            .replaceAll("DTSTART:", "DTSTART;TZID=America/Los_Angeles:")
            .replaceAll("DTEND:", "DTEND;TZID=America/Los_Angeles:")
            .replace(
                /PRODID:.*/,
                "PRODID:hyperschedule\n" + ICAL_TIMEZONE_HEADER,
            );

        return response
            .header("Content-Type", "text/calendar")
            .header(
                "Content-Disposition",
                `attachment; filename="${schedule.name}.ics"`,
            )
            .header("Cache-Control", "public,max-age=600")
            .send(patched);
    },
);

async function createCalendar(
    schedule: APIv4.UserSchedule,
): Promise<ics.ReturnObject> {
    const sectionIdSet = new Set(
        schedule.sections.flatMap((s) =>
            s.attrs.selected ? [APIv4.stringifySectionCodeLong(s.section)] : [],
        ),
    );
    const allSections = await getAllSections(schedule.term);
    const events: ics.EventAttributes[] = [];
    for (const section of allSections) {
        const sectionIdString = APIv4.stringifySectionCodeLong(
            section.identifier,
        );
        if (!sectionIdSet.has(sectionIdString)) continue;

        for (const schedule of section.schedules) {
            // async classes, also sometimes the registrar input incorrect data
            if (schedule.endTime <= schedule.startTime) continue;

            const startDate = new Date(
                section.startDate.year,
                section.startDate.month - 1, // Date month is 0-indexed
                section.startDate.day,
            );

            let daysUntilFirstClass = Math.min(
                ...schedule.days.map((wd) => {
                    const n = (weekdayIndex(wd) - startDate.getDay()) % 7;
                    return n >= 0 ? n : n + 7;
                }),
            );
            startDate.setDate(startDate.getDate() + daysUntilFirstClass);
            const startCourseDate = {
                year: startDate.getFullYear(),
                month: startDate.getMonth() + 1,
                day: startDate.getDate(),
            };

            const start = createDateTimeArray(
                startCourseDate,
                schedule.startTime,
            );
            const end = createDateTimeArray(startCourseDate, schedule.endTime);
            const recurrenceRule = createRRule(section.endDate, schedule.days);
            const title = section.course.title;
            const description = section.course.description;
            const location = schedule.locations.join("; ");
            events.push({
                startInputType: "local",
                startOutputType: "local",
                start,
                end,
                location,
                recurrenceRule,
                title,
                description,
            });
        }
    }

    logger.info("Creating calendar with events: %o", events);
    return createEvents(events);
}

function createDateTimeArray(
    date: APIv4.CourseDate,
    secs: number,
): ics.DateArray {
    const total_minutes = Math.floor(secs / 60);
    const hour = Math.floor(total_minutes / 60);
    const minute = total_minutes % 60;
    return [date.year, date.month, date.day, hour, minute];
}

function createRRule(endDate: APIv4.CourseDate, days: APIv4.Weekday[]): string {
    const daysString = days.map(weekdayToRRuleDay).join(",");
    const monthString = String(endDate.month).padStart(2, "0");
    const dayString = String(endDate.day).padStart(2, "0");
    const endString = `${endDate.year}${monthString}${dayString}T000000`;
    return (
        `FREQ=WEEKLY;` +
        `INTERVAL=1;` +
        `WKST=MO;` + // School week starts on Monday
        `BYDAY=${daysString};` +
        `UNTIL=${endString};`
    );
}

function weekdayToRRuleDay(day: APIv4.Weekday): string {
    const WD = APIv4.Weekday;
    switch (day) {
        case WD.monday:
            return "MO";
        case WD.tuesday:
            return "TU";
        case WD.wednesday:
            return "WE";
        case WD.thursday:
            return "TH";
        case WD.friday:
            return "FR";
        case WD.saturday:
            return "SA";
        case WD.sunday:
            return "SU";
    }
}

function weekdayIndex(day: APIv4.Weekday): number {
    const WD = APIv4.Weekday;
    switch (day) {
        case WD.sunday:
            return 0;
        case WD.monday:
            return 1;
        case WD.tuesday:
            return 2;
        case WD.wednesday:
            return 3;
        case WD.thursday:
            return 4;
        case WD.friday:
            return 5;
        case WD.saturday:
            return 6;
    }
}
