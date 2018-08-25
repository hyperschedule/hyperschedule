import React from 'react';
import PropTypes from 'prop-types';
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
  help: <Help />,
  importExport: <ImportExport />,
};

const Popup = ({mode, visible, close}) => {
  return (
    <div
      id="popup"
      className={visible ? ' visible' : ''}
      onClick={close}
    >
      <div className="box" onClick={stopPropagation}>
        <div className="header">
          <span className="title">{title[mode]}</span>
          <button className="close" onClick={close}>
            <i className="ion-md-close" />
          </button>
        </div>
        <div className="content">{content[mode]}</div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  mode: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default connect(
  state => {
    const popup = state.get('popup');
    return {
      mode: popup.get('mode'),
      visible: popup.get('visible'),
    };
  },
  dispatch => ({
    close: () => dispatch(actions.close()),
  }),
)(Popup);
