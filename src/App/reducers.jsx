import {combineReducers} from 'redux-immutable';

import {Map, List, Set} from 'immutable';

import search from './ModeContent/CourseSearch/reducers';
import focus from './FocusSummary/reducers';

import * as util from 'hyperschedule-util';

import * as actions from './actions';


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

const scheduleReducers = {
    [actions.courseSearch.ADD_COURSE]: (action, courses, order) => {
        const key = util.courseKey(action.course);
        if (courses.has(key)) {
            return {courses, order};
        }

        return {
            courses: courses.set(key, action.course),
            order: order.push(key),
        };
    },
    [actions.selectedCourses.REORDER]: (action, courses, order) => {
        const key = order.get(action.from);
        return {
            courses,
            order: order.delete(action.from).insert(action.to, key)
        };
    },
    [actions.selectedCourses.REMOVE_COURSE]: (action, courses, order) => {
        return {
            order: order.filter(key => key !== action.key),
            courses: courses.delete(action.key),
        };
    },
};
const schedule = (state = Map({
    courses: Map(),
    order: List(),
    selected: Set(),
}), action) => {
    
    const courses = state.get('courses');
    const order = state.get('order');

    if (!scheduleReducers.hasOwnProperty(action.type)) {
        return state;
    }

    const {
        order: newOrder,
        courses: newCourses,
    } = scheduleReducers[action.type](action, courses, order);

    return state.set('order', newOrder).set('courses', newCourses);
};

const app = combineReducers({
    mode,
    search,
    focus,
    schedule,
});

export default app;
