import * as modeSelector_ from "./App/ModeSelector/actions";
export const modeSelector = modeSelector_;

import * as courseSearch_ from "./App/CourseSearch/actions";
export const courseSearch = courseSearch_;

import * as schedule_ from "./App/Schedule/actions";
export const schedule = schedule_;

import * as selectedCourses_ from "./App/SelectedCourses/actions";
export const selectedCourses = selectedCourses_;

import * as controls_ from "./App/Controls/actions";
export const controls = controls_;

import * as importExport_ from "./App/Popup/ImportExport/actions";
export const importExport = importExport_;

export const ALL_COURSES = "api.ALL_COURSES";
export function allCourses(courses, timestamp) {
  return {
    type: ALL_COURSES,
    courses,
    timestamp,
  };
}

export const COURSES_SINCE = "api.COURSES_SINCE";
export function coursesSince(diff, timestamp) {
  return {
    type: COURSES_SINCE,
    diff,
    timestamp,
  };
}
