import { connect  } from 'react-redux';
import toJS from '../toJS';
import CourseSearchList from '../components/CourseSearchList';


const mapStateToProps = (state) => {
  let courses = state
      .get('courses')
      .filter((course) => course
              .get('courseName')
              .includes(state.get('searchString')));
  return {
    courses: courses.valueSeq(),
    course_ids: courses.keySeq()
  };
};


const mapDispatchToProps = (dispatch) => {
  return {};
};


const VisibleCourseSearchList = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(CourseSearchList));


export default VisibleCourseSearchList;
