import * as modeSelector_ from './App/ModeSelector/actions';
export const modeSelector = modeSelector_;

import * as courseSearch_ from './App/CourseSearch/actions';
export const courseSearch = courseSearch_;

import * as selectedCourses_ from './App/SelectedCourses/actions';
export const selectedCourses = selectedCourses_;

import * as controls_ from './App/Controls/actions';
export const controls = controls_;

import * as importExport_ from './App/Popup/ImportExport/actions';
export const importExport = importExport_;

export const UPDATE_COURSES = 'UPDATE_COURSES';
export function updateCourses(courses) {
  return {
    type: UPDATE_COURSES,
    courses
  };
}
