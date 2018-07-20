import {combineReducers} from 'redux-immutable';

import * as courseSearch from '../ModeContent/CourseSearch/actions';
import * as schedule from '../ModeContent/Schedule/actions';

import * as actions from './actions';

const height = (state = 0, action) => (
    action.type === actions.SET_HEIGHT ? (
        action.height
    ) : (
        state
    )
);

const course = (state = null, action) => (
    //    (action.type === actions.modeContent.courseSearch.FOCUS_COURSE ||
    //     action.type === actions.modeContent.schedule.FOCUS_COURSE) ? (
    action.type === courseSearch.FOCUS_COURSE ? (
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


