export const REORDER = 'App/SelectedCourses/REORDER';
export const reorder = (from, to) => ({
    type: REORDER,
    from,
    to,
});

export const FOCUS_COURSE = 'App/SelectedCourses/FOCUS_COURSE';
export const focusCourse = course => ({
    type: FOCUS_COURSE,
    course,
});
