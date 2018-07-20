import {combineReducers} from 'redux-immutable';
import {List, OrderedMap, Map, OrderedSet} from 'immutable';

import {computeCourseKey} from './util';

import search from './ModeContent/CourseSearch/reducers';
import focus from './FocusSummary/reducers';

import * as actions from './actions';

import {
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

const schedule = (state = Map({courses: Map(), order: List()}), action) => {
    const courses = state.get('courses');
    const order = state.get('order');

    let key;
    
    switch (action.type) {
    case actions.courseSearch.ADD_COURSE:
        key = computeCourseKey(action.course);
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
        return state;

    default:
        return state;
    }
};

      
//      courses: (state = Map(), action) => {
//        switch (action.type) {
//        case actions.courseSearch.ADD_COURSE:
//            return state.set(computeCourseKey(action.course), action.course);
//        default:
//            return state;
//        }
//    },
//    order: (state = List(), action) => {
//        switch (action.type) {
//        case actions.courseSearch.ADD_COURSE:
//            return 
//        }
//    },
//});


function updateCourses(state = OrderedMap(), action) {
    switch (action.type) {
    case UPDATE_COURSES:
        return action.courses;
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
    focus,
    courses: updateCourses,
    schedule,
});

export default hyperschedule;
