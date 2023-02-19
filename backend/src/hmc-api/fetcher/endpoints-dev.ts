import type { Endpoints } from "./types";

export const endpoints: Endpoints = {
    // fetch once per minute
    permCount: {
        link: "perm-count",
        params: null,
        interval: 60,
        saveAs: "perm-count.json",
    },
    courseSection: {
        link: "course-section",
        params: null,
        interval: 60,
        saveAs: "course-section.json",
    },
    // fetch once per hour
    staff: {
        link: "staff",
        params: null,
        interval: 3600,
        saveAs: "staff.json",
    },
    altstaff: {
        link: "alt-staff",
        params: null,
        interval: 3600,
        saveAs: "alt-staff.json",
    },
    course: {
        link: "course",
        params: null,
        interval: 3600,
        saveAs: "course.txt",
    },
    courseSectionSchedule: {
        link: "course-section-schedule",
        params: null,
        interval: 3600,
        saveAs: "course-section-schedule.json",
    },
    calendarSession: {
        link: "calendar-session",
        params: null,
        interval: 3600,
        saveAs: "calendar-session.json",
    },
    calendarSessionSection: {
        link: "calendar-session-section",
        params: null,
        interval: 3600,
        saveAs: "calendar-session-section.json",
    },
    sectionInstructor: {
        link: "section-instructor",
        params: null,
        interval: 3600,
        saveAs: "section-instructor.json",
    },
    // fetch once per day
    courseAreas: {
        link: "course-areas",
        params: null,
        interval: 3600 * 24,
        saveAs: "course-areas.json",
    },
    courseAreaDescription: {
        link: "course-areas-description",
        params: null,
        interval: 3600 * 24,
        saveAs: "course-areas-description.json",
    },
};
