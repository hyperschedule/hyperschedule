import { connect  } from 'react-redux';
import { removeCourse } from '../actions.js';
import toJS from '../toJS';
import CourseListItem from '../components/CourseListItem';


const mapStateToProps = (state, ownProps) => {
  return {
    course: state.get('courses').get(ownProps.courseId)
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (event, data) => {
      dispatch(removeCourse(data.courseid));
    }
  };
};


const VisibleCourseListItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(CourseListItem));


export default VisibleCourseListItem;
