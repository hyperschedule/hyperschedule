
import * as modeSelector_ from './ModeSelector/actions';
export const modeSelector = modeSelector_;

import * as modeContent_ from './ModeContent/actions';
export const modeContent = modeContent_;

export const Mode = {
    COURSE_SEARCH: 'Mode.COURSE_SEARCH',
    SCHEDULE: 'Mode.SCHEDULE',
};


//
//export const TYPE_COURSE_SEARCH = 'TYPE_COURSE_SEARCH';
//export function typeCourseSearch(text) {
//  return {
//    type: TYPE_COURSE_SEARCH,
//    text
//  };
//}
//
//
export const UPDATE_COURSES = 'UPDATE_COURSES';
export function updateCourses(courses) {
    return {
        type: UPDATE_COURSES,
        courses
    };
}
//
//
//export const ADD_COURSE = 'ADD_COURSE';
//export function addCourse(courseId) {
//  return {
//    type: ADD_COURSE,
//    courseId
//  };
//}
//
//export const REMOVE_COURSE = 'REMOVE_COURSE';
//export function removeCourse(courseId) {
//  return {
//    type: REMOVE_COURSE,
//    courseId
//  };
//}
//
//export const REORDER_COURSE = 'REORDER_COURSE';
//export function reorderCourse(oldIndex, newIndex) {
//  return {
//    type: REORDER_COURSE,
//    oldIndex,
//    newIndex
//  };
//}
//
