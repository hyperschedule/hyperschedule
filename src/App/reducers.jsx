import { combineReducers } from 'redux-immutable';
import { List, OrderedMap } from 'immutable';

import {
  TYPE_COURSE_SEARCH,
  UPDATE_COURSES,
  SWITCH_MAIN_PANEL_MODE,
  ADD_COURSE,
  REMOVE_COURSE,
  REORDER_COURSE,
  MainPanelMode
} from './actions';

const { SCHEDULE } = MainPanelMode;

function mainPanelMode(state = SCHEDULE, action) {
  switch (action.type) {
    case SWITCH_MAIN_PANEL_MODE:
    return action.mode;
  default:
    return state;
  }
}

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
  mainPanelMode: mainPanelMode,
  courses: updateCourses,
  searchString: typeCourseSearch,
  courseList: updateCourseList
});

export default hyperschedule;
