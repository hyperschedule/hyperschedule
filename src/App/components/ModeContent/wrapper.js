import {connect} from 'react-redux';
import ModeContent from './ModeContent';

const ModeContentWrapper = connect(
    state => ({
        mode: state.get('mode'),
    }),
    dispatch => ({}),
)(ModeContent);

export default ModeContentWrapper;
