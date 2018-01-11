import { connect  } from 'react-redux';
import toJS from '../toJS';
import MainPanelContents from '../components/MainPanelContent';


const mapStateToProps = (state) => {
  return {
    currentMode: state.get('mainPanelMode')
  };
};


const mapDispatchToProps = (dispatch) => {
  return {};
};


const VisibleMainPanelContents = connect(
  mapStateToProps,
  mapDispatchToProps
)(toJS(MainPanelContents));


export default VisibleMainPanelContents;
