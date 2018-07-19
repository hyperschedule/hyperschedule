import {combineReducers} from 'redux-immutable';
import {List, OrderedMap, Map} from 'immutable';

import search from './ModeContent/CourseSearch/reducers';
import * as actions from './actions';

import {
    TYPE_COURSE_SEARCH,
    UPDATE_COURSES,
    ADD_COURSE,
    REMOVE_COURSE,
    REORDER_COURSE,
} from './actions';


const mode = (
    state = actions.Mode.COURSE_SEARCH,
    action
) => (
    action.type === actions.modeSelector.SET_MODE ? (
        action.mode
    ) : (
        state
    )
);

const focusCourse = (state = null, action) => (
    //    (action.type === actions.modeContent.courseSearch.FOCUS_COURSE ||
    //     action.type === actions.modeContent.schedule.FOCUS_COURSE) ? (
    action.type === actions.modeContent.courseSearch.FOCUS_COURSE ? (
        action.course
    ) : (
        state
    )
);


function updateCourses(state = OrderedMap(), action) {
    switch (action.type) {
    case UPDATE_COURSES:
        return action.courses;
    default:
        return state;
    }
}

function typeCourseSearch(state = '', action) {
    switch (action.type) {
    case TYPE_COURSE_SEARCH:
        return action.text;
    default:
        return state;
    }
}

function updateCourseList(state = List(), action) {
    switch (action.type) {
    case ADD_COURSE:
        return state.push(action.courseId);
    case REMOVE_COURSE:
        return state.filterNot((item) => item === action.courseId);
    case REORDER_COURSE:
        const value = state.get(action.oldIndex);
        return state
            .delete(action.oldIndex)
            .insert(action.newIndex, value);
    default:
        return state;
    }
}

const hyperschedule = combineReducers({
    mode,
    search,
    focusCourse,
    courses: updateCourses,
    courseList: updateCourseList
});

export default hyperschedule;
