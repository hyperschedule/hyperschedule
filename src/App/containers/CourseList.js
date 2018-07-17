import { connect  } from 'react-redux';
import toJS from '../toJS';
import { reorderCourse } from '../actions';
import CourseList from '../components/CourseList';


const mapStateToProps = (state) => {
  return {
    courseList: state.get('courseList')
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    onSortEnd: (event) => {
      dispatch(reorderCourse(event.oldIndex, event.newIndex));
    }
  };
};


const VisibleCourseSearchInput = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(CourseList));


export default VisibleCourseSearchInput;
