import { connect  } from 'react-redux';
import * as actions from './actions';
//import toJS from '../toJS';
import ModeSelector from './ModeSelector';

const ModeSelectorWrapper = connect(
    state => ({
        mode: state.get('mode'),
    }),
    dispatch => ({
        setMode: mode => dispatch(actions.setMode(mode)),
    }),
)(ModeSelector);

export default ModeSelectorWrapper;
