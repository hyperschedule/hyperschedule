import {connect} from 'react-redux';
import React from 'react';

import Popup from 'reactjs-popup';

import * as actions from './actions';
import './Controls.css';

const Controls = ({showHelp, showImportExport}) => {
  
  return (
    <div id='controls'>
      <a href='https://github.com/MuddCreates/hyperschedule'
         className='button github'
         target='_blank'
         rel='noopener noreferrer'>
        <i className='ion-logo-github'></i>
      </a>
      <button className='import-export-data'
              onClick={showImportExport}>
        <i className='ion-md-share-alt'></i>
      </button>
      <button className='help'
              onClick={showHelp}>
        <i className='ion-md-help'></i>
      </button>
    </div>
  );
};

const ControlsWrapper = connect(
  state => ({
    
  }),
  dispatch => ({
    showHelp: () => dispatch(actions.showHelp()),
    showImportExport: () => dispatch(actions.showImportExport()),
  }),
)(Controls);

export default ControlsWrapper;
