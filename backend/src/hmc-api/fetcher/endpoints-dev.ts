import type { Endpoints } from "./types";

export const endpoints: Endpoints = {
    // fetch once per minute
    permCount: {
        link: "perm-count",
        param: null,
        interval: 60,
        saveAs: "perm-count.json",
    },
    courseSection: {
        link: "course-section",
        param: null,
        interval: 60,
        saveAs: "course-section.json",
    },
    // fetch once per hour
    staff: {
        link: "staff",
        param: null,
        interval: 3600,
        saveAs: "staff.json",
    },
    altstaff: {
        link: "altstaff",
        param: null,
        interval: 3600,
        saveAs: "alt-staff.json",
    },
    courseRaw: {
        link: "course-raw",
        param: null,
        interval: 3600,
        saveAs: "course.txt",
    },
    courseSectionSchedule: {
        link: "course-section-schedule",
        param: null,
        interval: 3600,
        saveAs: "course-section-schedule.json",
    },
    calendarSession: {
        link: "calendar-session",
        param: null,
        interval: 3600,
        saveAs: "calendar-session.json",
    },
    calendarSessionSection: {
        link: "calendar-session-section",
        param: null,
        interval: 3600,
        saveAs: "calendar-session-section.json",
    },
    sectionInstructor: {
        link: "section-instructor",
        param: null,
        interval: 3600,
        saveAs: "section-instructor.json",
    },
    // fetch once per day
    courseAreas: {
        link: "course-area",
        param: null,
        interval: 3600 * 24,
        saveAs: "course-area.json",
    },
    courseAreaDescription: {
        link: "course-area-description",
        param: null,
        interval: 3600 * 24,
        saveAs: "course-areas-description.json",
    },
};

export const endpointAuthorization = "local dev";
