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
    [actions.courseSearch.ADD_COURSE]: (state, {course}) => {
        const courses = state.get('courses');
        const order = state.get('order');
        
        const key = course.key;
        if (courses.has(key)) {
            return {courses, order};
        }

        return state.set(
            'order', order.push(key),
        ).set(
            'courses', courses.set(key, course),
        );
        
    },
    [actions.selectedCourses.REORDER]: (state, {from, to}) => {
        const order = state.get('order');
        
        const key = order.get(from);
        return state.set(
            'order',
            order.delete(from).insert(to, key),
        );
    },
    [actions.selectedCourses.REMOVE_COURSE]: (state, {key}) => {
        const courses = state.get('courses');
        const order = state.get('order');
        
        return state.set(
            'order', order.filter(key => key !== key),
        ).set(
            'courses', courses.delete(key),
        );
    },
};

const schedule = (state = Map({
    selection: Map({
        courses: Map(),
        order: List(),
        starred: Set(),
    }),
    scheduled: Set(),
}), action) => {

    if (!scheduleReducers.hasOwnProperty(action.type)) {
        return state;
    }

    const selection = scheduleReducers[action.type](state.get('selection'), action);

    const courses = selection.get('courses');
    const starred = selection.get('starred');
    const order = selection.get('order');

    let scheduled = Set();

    for (const key of order) {
        if (!starred.has(key)) {
            continue;
        }

        scheduled.add(key);
    }

    for (const key of order) {
        const course = courses.get(key);

        let conflict = false;
        for (const otherKey of scheduled) {
            const other = courses.get(otherKey);
            
            if (course.conflicts(other)) {
                conflict = true;
                break;
            }
        }
        
        if (conflict) {
            continue;
        }

        scheduled = scheduled.add(key);
    }

    return state.set('selection', selection).set('scheduled', scheduled);
};

const app = combineReducers({
    mode,
    search,
    focus,
    schedule,
});

export default app;
