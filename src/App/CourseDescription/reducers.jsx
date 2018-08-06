import {combineReducers} from 'redux-immutable';

import * as courseSearch    from '@/App/CourseSearch/actions';
import * as schedule        from '@/App/Schedule/actions';
import * as selectedCourses from '@/App/SelectedCourses/actions';

import * as actions from './actions';

const course = (state = null, action) => {
  switch (action.type) {
  case courseSearch.FOCUS_COURSE:
  case selectedCourses.FOCUS_COURSE:
    return action.course;
  case schedule.FOCUS_
  }
};
(
  (action.type === courseSearch.FOCUS_COURSE ||
   action.type === selectedCourses.FOCUS_COURSE ||
   action.type === schedule.FOCUS_COURSE) ? (
     action.
   ) : (
     state
   )
);
export default combineReducers({
  course,
});


