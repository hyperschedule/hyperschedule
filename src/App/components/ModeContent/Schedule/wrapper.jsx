import {connect} from 'react-redux';
import Schedule from './Schedule';

const ScheduleWrapper = connect(
    state => ({schedule: state.get('courseList')}),
    dispatch => ({}),
)(Schedule);

export default ScheduleWrapper;
