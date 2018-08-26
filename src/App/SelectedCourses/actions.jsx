export const REORDER = "App/SelectedCourses/REORDER";
export const reorder = (from, to) => ({
  type: REORDER,
  from,
  to,
});

export const FOCUS_COURSE = "App/SelectedCourses/FOCUS_COURSE";
export const focusCourse = key => ({
  type: FOCUS_COURSE,
  key,
});

export const REMOVE_COURSE = "App/SelectedCourses/REMOVE_COURSE";
export const removeCourse = key => ({
  type: REMOVE_COURSE,
  key,
});

export const TOGGLE_COURSE_CHECKED =
  "App/SelectedCourses/TOGGLE_COURSE_CHECKED";
export const toggleCourseChecked = key => ({
  type: TOGGLE_COURSE_CHECKED,
  key,
});

export const TOGGLE_COURSE_STARRED =
  "App/SelectedCourses/TOGGLE_COURSE_STARRED";
export const toggleCourseStarred = key => ({
  type: TOGGLE_COURSE_STARRED,
  key,
});
