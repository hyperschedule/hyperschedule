import {combineReducers} from 'redux-immutable';

import * as courseSearch    from '@/App/CourseSearch/actions';
import * as schedule        from '@/App/Schedule/actions';
import * as selectedCourses from '@/App/SelectedCourses/actions';

import * as actions from './actions';

const height = (state = 0, action) => (
  action.type === actions.SET_HEIGHT ? (
    action.height
  ) : (
    state
  )
);

const course = (state = null, action) => (
  (action.type === courseSearch.FOCUS_COURSE ||
   action.type === selectedCourses.FOCUS_COURSE ||
   action.type === schedule.FOCUS_COURSE) ? (
     action.course
   ) : (
     state
   )
);
const focusSummary = combineReducers({
  height,
  course,
});
export default focusSummary;


