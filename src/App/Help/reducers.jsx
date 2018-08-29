import {combineReducers} from "redux-immutable";

import * as actions from "./actions";

const visible = (state = false, action) => {
  switch (action.type) {
    case actions.controls.SHOW_HELP:
      return true;
    case actions.CLOSE:
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  visible,
});
