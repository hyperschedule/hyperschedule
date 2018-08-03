import {Map} from 'immutable';
import * as actions from './actions';

export default (state = Map({
  mode: '',
  visible: false,
}), action) => {
  switch (action.type) {
  case actions.importExport.CLOSE:
  case actions.CLOSE:
    return state.set('visible', false);
  case actions.controls.SHOW_HELP:
    return (
      state
        .set('mode', 'help')
        .set('visible', true)
    );
  case actions.controls.SHOW_IMPORT_EXPORT:
    return (
      state
        .set('mode', 'importExport')
        .set('visible', true)
    );
    
  default:
    return state;
  }
  
};
