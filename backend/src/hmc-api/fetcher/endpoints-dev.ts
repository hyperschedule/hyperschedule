import type { Endpoint } from "./types";

export const endpoints: Endpoint[] = [
    {
        link: "permCount",
        params: null,
        interval: 60,
        for: "permCount",
    },
    {
        link: "course-section",
        params: null,
        interval: 60,
        for: "courseSection",
    },
    {
        link: "staff",
        params: null,
        interval: 3600,
        for: "staff",
    },
    {
        link: "alt-staff",
        params: null,
        interval: 3600,
        for: "altstaff",
    },
    {
        link: "course",
        params: null,
        interval: 3600,
        for: "course",
    },
    {
        link: "course-section-schedule",
        params: null,
        interval: 3600,
        for: "courseSectionSchedule",
    },
    {
        link: "course-session",
        params: null,
        interval: 3600,
        for: "calendarSession",
    },
    {
        link: "calendar-session-section",
        params: null,
        interval: 3600,
        for: "calendarSessionSection",
    },
    {
        link: "section-instructor",
        params: null,
        interval: 3600,
        for: "sectionInstructor",
    },
    {
        link: "course-area",
        params: null,
        interval: 3600 * 24,
        for: "courseAreas",
    },
];
