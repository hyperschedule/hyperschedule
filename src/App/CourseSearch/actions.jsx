export const SET_SEARCH = 'App/ModeContent/CourseSearch/SET_SEARCH';
export const setSearch = string => ({
  type: SET_SEARCH,
  string,
});

export const FOCUS_COURSE = 'App/ModeContent/CourseSearch/FOCUS_COURSE';
export const focusCourse = course => ({
  type: FOCUS_COURSE,
  course,
});

export const ADD_COURSE = 'App/ModeContent/CourseSearch/ADD_COURSE';
export const addCourse = course => ({
  type: ADD_COURSE,
  course,
});
