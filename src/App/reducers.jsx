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


const scheduleReducers = {
  [actions.courseSearch.ADD_COURSE]: (state, {course}) => {
    const courses = state.get('courses');
    const order = state.get('order');
    const checked = state.get('checked');
    
    const key = util.courseKey(course);
    if (courses.has(key)) {
      return state;
    }

    return state.set(
      'order', order.push(key),
    ).set(
      'courses', courses.set(key, course),
    ).set(
      'checked', checked.add(key),
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
      'order', order.filter(courseKey => courseKey !== key),
    ).set(
      'courses', courses.delete(key),
    );
  },
  [actions.selectedCourses.TOGGLE_COURSE_CHECKED]: (state, {key}) => {
    let checked = state.get('checked');
    if (checked.has(key)) {
      checked = checked.delete(key);
    } else {
      checked = checked.add(key);
    }

    return state.set('checked', checked);
  },
  [actions.selectedCourses.TOGGLE_COURSE_STARRED]: (state, {key}) => {
    let starred = state.get('starred');
    if (starred.has(key)) {
      starred = starred.delete(key);
    } else {
      starred = starred.add(key);
    }

    return state.set('starred', starred);
  },

};

const schedule = (state = Map({
  selection: Map({
    courses: Map(),
    order: List(),
    starred: Set(),
    checked: Set(),
  }),
  scheduled: Set(),
}), action) => {

  if (!scheduleReducers.hasOwnProperty(action.type)) {
    return state;
  }

  const selection = scheduleReducers[action.type](state.get('selection'), action);

  const courses = selection.get('courses');
  const starred = selection.get('starred');
  const checked = selection.get('checked');
  const order = selection.get('order');

  return state.set('selection', selection).set('scheduled', util.computeSchedule(selection));
};

const app = combineReducers({
  mode,
  search,
  focus,
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
          state.get('schedule').get('selection'),
        ),
      )
    );
  case actions.importExport.APPLY_DATA:
    const selection = util.deserializeSelection(
      JSON.parse(
        state.get('importExport'),
      )
    );
    return state.setIn(
      ['schedule', 'selection'], selection,
    ).setIn(['schedule', 'scheduled'], util.computeSchedule(selection));
  default:
    return state;
  }
};
