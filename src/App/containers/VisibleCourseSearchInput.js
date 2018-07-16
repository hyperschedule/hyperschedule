import { connect  } from 'react-redux';
import { typeCourseSearch } from '../actions.js';
import toJS from '../toJS';
import CourseSearchInput from '../components/CourseSearchInput';


const mapStateToProps = (state) => {
  return {
    value: state.get('searchString')
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    onChange: (event) => {
      dispatch(typeCourseSearch(event.target.value));
    }
  };
};


const VisibleCourseSearchInput = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(CourseSearchInput));


export default VisibleCourseSearchInput;
