import {combineReducers} from 'redux-immutable';

import * as actions from './actions';

const height = (state = 0, action) => (
    action.type === actions.SET_HEIGHT ? (
        action.height
    ) : (
        state
    )
);

const focusSummary = combineReducers({height});
export default focusSummary;
