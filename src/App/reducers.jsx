import {combineReducers} from 'redux-immutable';

import {Map, List, Set} from 'immutable';

import search from './ModeContent/CourseSearch/reducers';
import focus from './CourseDescription/reducers';
import popup from './Popup/reducers';
import importExport from './Popup/ImportExport/reducers';

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

const selectionInitial = Map({
  courses: Map(),
  order: List(),
  checked: Set(),
  starred: Set(),
});
const selection = (prev = Map(), action) => {
  const state = selectionInitial.merge(prev);
  const courses = state.get('courses'),
        order   = state.get('order'),
        checked = state.get('checked'),
        starred = state.get('starred');

  switch (action.type) {
  case actions.courseSearch.ADD_COURSE: {
    const key = util.courseKey(action.course);

    if (courses.has(key)) {
      return state;
    }

    return state.merge({
      order: order.push(key),
      courses: courses.set(key, action.course),
      checked: checked.add(key),
    });
  }
  case actions.selectedCourses.REORDER: {
    const key = order.get(action.from);
    return state.set(
      'order',
      order.delete(action.from).insert(action.to, key),
    );
  }
  case actions.selectedCourses.REMOVE_COURSE: {
    return state.merge({
      order: order.filter(courseKey => courseKey !== action.key), 
      courses: courses.delete(action.key),
    });
  }
  case actions.selectedCourses.TOGGLE_COURSE_CHECKED: {
    const courseChecked = checked.has(action.key);
    if (checked.has(action.key)) {
      return state.set('checked', checked.delete(action.key));
    } else {
      return state.set('checked', checked.add(action.key));
    }
  }
  case actions.selectedCourses.TOGGLE_COURSE_STARRED: {
    const courseStarred = starred.has(action.key);
    if (starred.has(action.key)) {
      return state.set('starred', starred.delete(action.key));
    } else {
      return state.set('starred', starred.add(action.key));
    }
  }
  default:
    return state;
  }
};

const schedule = (state = Set(), action) => state;

const app = combineReducers({
  mode,
  search,
  focus,
  selection,
  schedule,
  popup,
  importExport,
});

export default (prev = Map(), action) => {
  const state = app(prev, action);
  
  switch (action.type) {
  case actions.controls.SHOW_IMPORT_EXPORT:
    return state.set(
      'importExport',
      JSON.stringify(
        util.serializeSelection(
          state.get('selection'),
        ),
      )
    );
    
  case actions.importExport.APPLY_DATA: {
    const selection = util.deserializeSelection(
      JSON.parse(
        state.get('importExport'),
      )
    );
    return state.merge({
      selection,
      schedule: util.computeSchedule(selection),
    });
  }

  case actions.courseSearch.ADD_COURSE: 
  case actions.selectedCourses.REORDER: 
  case actions.selectedCourses.REMOVE_COURSE: 
  case actions.selectedCourses.TOGGLE_COURSE_CHECKED: 
  case actions.selectedCourses.TOGGLE_COURSE_STARRED: {
    const selection = state.get('selection');
    return state.set(
      'schedule', util.computeSchedule(selection),
    );
  }

  default:
    return state;
  }
};
