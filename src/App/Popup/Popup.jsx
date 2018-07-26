import React from 'react';
import {connect} from 'react-redux';

import Help from './Help/Help';
import ImportExport from './ImportExport/ImportExport';

import * as actions from './actions';
import './Popup.css';

const stopPropagation = event => event.stopPropagation();


const title = {
  help: 'Help',
  importExport: 'Import/export data',
};

const content = {
  help: <Help/>,
  importExport: <ImportExport/>,
};

const Popup = ({mode, visible, close}) => {
  return (
    <div id='popup'
         className={visible ? ' visible' : ''}
         onClick={close}>
      <div className='box'
           onClick={stopPropagation}>
        <div className='header'>
          <span className='title'>
            {title[mode]}
          </span>
          <button className='close' onClick={close}>
            <i className='ion-md-close'></i>
          </button>
        </div>
        <div className='content'>
          {content[mode]}
        </div>
      </div>
    </div>
  );
};

export default connect(
  state => ({
    mode: state.get('app').get('popup').get('mode'),
    visible: state.get('app').get('popup').get('visible'),
  }),
  dispatch => ({
    close: () => dispatch(actions.close()),
  }),
)(Popup);
