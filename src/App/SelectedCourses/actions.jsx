export const REORDER = 'App/SelectedCourses/REORDER';
export const reorder = (from, to) => ({
    type: REORDER,
    from,
    to,
});
