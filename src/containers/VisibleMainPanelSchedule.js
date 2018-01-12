import { connect  } from 'react-redux';
import toJS from '../toJS';
import MainPanelSchedule from '../components/MainPanelSchedule';
import { computeSchedule } from '../model';

const mapStateToProps = (state, ownProps) => {
  let courses = [];
  for (let courseId of state.get('courseList')) {
    let course = state.getIn(['courses', courseId]).toJS();
    course.selected = true;
    courses.push(course);
  }
  const schedule = computeSchedule(courses);
  return {
    schedule
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
  };
};


const VisibleMainPanelSchedule = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(MainPanelSchedule));


export default VisibleMainPanelSchedule;
