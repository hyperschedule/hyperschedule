import {combineReducers} from 'redux-immutable';
import {List, OrderedMap, Map, OrderedSet, Set} from 'immutable';

import * as actions from './actions';

import {Mode} from '@/App/mode';

import {
  UPDATE_COURSES,
  ADD_COURSE,
  REMOVE_COURSE,
  REORDER_COURSE,
} from './actions';

import search       from './App/CourseSearch/reducers';
import focus        from './App/CourseDescription/reducers';
import popup        from './App/Popup/reducers';
import importExport from './App/Popup/ImportExport/reducers';

import * as util from '@/util/hyperschedule-util';


const mode = (
  state = Mode.COURSE_SEARCH,
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


function updateCourses(state = OrderedMap(), action) {
  switch (action.type) {
  case UPDATE_COURSES:
    return action.courses;
  default:
    return state;
  }
}

const app = combineReducers({
  mode,
  search,
  focus,
  selection,
  schedule,
  popup,
  importExport,
  courses: updateCourses,
});

export default (prev = Map(), action) => {
  const state = app(prev, action);
  
  switch (action.type) {
  case actions.controls.SHOW_IMPORT_EXPORT:
    return state.setIn(
      ['importExport', 'data'],
      JSON.stringify(
        util.serializeSelection(
          state.get('selection'),
        ),
      )
    );
    
  case actions.importExport.APPLY_DATA: {
    const selection = util.deserializeSelection(
      JSON.parse(
        state.getIn(['importExport', 'data']),
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

