import {combineReducers} from 'redux-immutable';
import {List, OrderedMap, Map, OrderedSet} from 'immutable';

import {courseKey} from 'hyperschedule-util';

import * as actions from './actions';

import app from './App/reducers';

import {
  UPDATE_COURSES,
  ADD_COURSE,
  REMOVE_COURSE,
  REORDER_COURSE,
} from './actions';




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
  app,
  courses: updateCourses,
});

export default hyperschedule;
