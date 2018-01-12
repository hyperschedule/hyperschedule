import { connect  } from 'react-redux';
import toJS from '../toJS';
import CourseSearchList from '../components/CourseSearchList';


const mapStateToProps = (state) => {
  return {
    course_ids: state.get('courses')
      .filter((course) => course
              .get('courseName')
              .includes(state.get('searchString')))
      .keySeq()
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
