import {combineReducers} from 'redux-immutable';

import * as actions from './actions';

const searchString = (state = '', action) =>
  action.type === actions.SET_SEARCH ? action.string : state;

const search = combineReducers({
  string: searchString,
});

export default search;
