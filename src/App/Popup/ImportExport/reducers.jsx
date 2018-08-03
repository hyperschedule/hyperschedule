import * as actions from './actions';

const importExport = (state = '', action) => {
  switch (action.type) {
  case actions.SET_DATA:
    return action.data;
  default:
    return state;
  }
};

export default importExport;
