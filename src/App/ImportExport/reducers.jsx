import {combineReducers} from "redux-immutable";

import * as actions from "./actions";

const data = (state = "", action) => {
  switch (action.type) {
    case actions.SET_DATA:
      return action.data;
    default:
      return state;
  }
};

const visible = (state = false, action) => {
  switch (action.type) {
    case actions.controls.SHOW_IMPORT_EXPORT:
      return true;
    case actions.CLOSE:
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  data,
  visible,
});
