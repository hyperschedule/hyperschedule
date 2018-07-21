import * as modeSelector_ from './ModeSelector/actions';
export const modeSelector = modeSelector_;

import * as courseSearch_ from './ModeContent/CourseSearch/actions';
export const courseSearch = courseSearch_;

import * as selectedCourses_ from './SelectedCourses/actions';
export const selectedCourses = selectedCourses_;


export const Mode = {
    COURSE_SEARCH: 'Mode.COURSE_SEARCH',
    SCHEDULE: 'Mode.SCHEDULE',
};
