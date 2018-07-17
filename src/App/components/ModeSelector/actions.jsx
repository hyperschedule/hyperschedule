

export const Mode = {
    COURSE_SEARCH: 'COURSE_SEARCH',
    SCHEDULE: 'SCHEDULE',
};

export const SET_MODE = 'ModeSelector.SET_MODE';
export const setMode = (mode) => ({
    type: SET_MODE,
    mode,
});
