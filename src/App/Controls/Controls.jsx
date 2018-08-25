import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import './Controls.css';

const Controls = ({showHelp, showImportExport}) => {
  return (
    <div id="controls">
      <a
        href="https://github.com/MuddCreates/hyperschedule"
        className="button github"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="ion-logo-github" />
      </a>
      <button className="settings">
        <i className="ion-md-bicycle" />
      </button>
      <button
        className="import-export-data"
        onClick={showImportExport}
      >
        <i className="ion-md-share-alt" />
      </button>
      <button className="help" onClick={showHelp}>
        <i className="ion-md-help" />
      </button>
    </div>
  );
};

Controls.propTypes = {
  showHelp: PropTypes.func.isRequired,
  showImportExport: PropTypes.func.isRequired,
};

const ControlsWrapper = connect(
  () => ({}),
  dispatch => ({
    showHelp: () => dispatch(actions.showHelp()),
    showImportExport: () => dispatch(actions.showImportExport()),
  }),
)(Controls);

export default ControlsWrapper;
