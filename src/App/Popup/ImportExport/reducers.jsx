import {combineReducers} from 'redux-immutable';

import * as actions from './actions';

const data = (state = '', action) => {
  switch (action.type) {
  case actions.SET_DATA:
    return action.data;
  default:
    return state;
  }
};

export default combineReducers({
  data,
});
