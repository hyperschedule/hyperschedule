export const SET_SEARCH = 'App/ModeContent/CourseSearch/SET_SEARCH';
export const setSearch = string => ({
  type: SET_SEARCH,
  string,
});

export const FOCUS_COURSE = 'App/ModeContent/CourseSearch/FOCUS_COURSE';
export const focusCourse = key => ({
  type: FOCUS_COURSE,
  key,
});

export const ADD_COURSE = 'App/ModeContent/CourseSearch/ADD_COURSE';
export const addCourse = key => ({
  type: ADD_COURSE,
  key,
});
