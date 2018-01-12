import { connect  } from 'react-redux';
import { switchMainPanelMode } from '../actions.js';
import toJS from '../toJS';
import MainPanelModeSelector from '../components/MainPanelModeSelector';


const mapStateToProps = (state) => {
  return {
    currentMode: state.get('mainPanelMode')
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (event, data) => {
      dispatch(switchMainPanelMode(data.mode));
    }
  };
};


const VisibleCourseSearchInput = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(MainPanelModeSelector));


export default VisibleCourseSearchInput;
