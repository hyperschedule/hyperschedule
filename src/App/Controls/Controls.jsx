import {connect} from 'react-redux';
import React from 'react';

import * as actions from './actions';
import './Controls.css';

const Controls = ({showHelp, showImportExport}) => {
    return (
        <div id='controls'>
          <a href='https://github.com/MuddCreates/hyperschedule'
             className='button github'
             target='_blank'>
            <i className='ion-logo-github'></i> Github
          </a>
          <button className='import-export-data'>Import/export data</button>
          <button className='help'>Help</button>
        </div>
    );
};

const ControlsWrapper = connect(
    state => ({}),
    dispatch => ({
        showHelp: () => dispatch(actions.showHelp()),
        showImportExport: () => dispatch(actions.showImportExport()),
    }),
)(Controls);

export default ControlsWrapper;
