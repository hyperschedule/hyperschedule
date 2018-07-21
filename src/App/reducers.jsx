import {combineReducers} from 'redux-immutable';

import {Map, List} from 'immutable';

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

const schedule = (state = Map({courses: Map(), order: List()}), action) => {
    const courses = state.get('courses');
    const order = state.get('order');

    let key;
    
    switch (action.type) {
    case actions.courseSearch.ADD_COURSE:
        key = util.courseKey(action.course);
        if (courses.has(key)) {
            return state;
        }

        return state.set(
            'courses', courses.set(key, action.course)
        ).set(
            'order', order.push(key)
        );

    case actions.selectedCourses.REORDER:
        key = order.get(action.from);
        return state.set(
            'order',
            order.delete(action.from).insert(action.to, key),
        );

    case actions.selectedCourses.REMOVE_COURSE:
        return state.set(
            'order',
            order.filter(key => key !== action.key),
        ).set(
            'courses', courses.delete(action.key),
        );

    default:
        return state;
    }
};

const app = combineReducers({
    mode,
    search,
    focus,
    schedule,
});

export default app;
