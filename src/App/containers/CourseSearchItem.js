import { connect  } from 'react-redux';
import { addCourse } from '../actions.js';
import toJS from '../toJS';
import CourseSearchItem from '../components/CourseSearchItem';


const mapStateToProps = (state, ownProps) => {
  return {
    course: state.get('courses').get(ownProps.courseId)
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (event, data) => {
      dispatch(addCourse(data.courseid));
    }
  };
};


const VisibleCourseSearchItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(CourseSearchItem));


export default VisibleCourseSearchItem;
