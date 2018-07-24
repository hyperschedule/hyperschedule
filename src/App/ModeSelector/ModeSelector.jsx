import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';
import {Mode} from '../actions';

import './ModeSelector.css';

const ModeSelector = ({mode, setMode}) => (
  <div id="mode-selector">
    <button
      className={(mode === Mode.COURSE_SEARCH ? 'active' : '') + ' left'}
      onClick={() => setMode(Mode.COURSE_SEARCH)}>
      Course Search
    </button>
    <button
      className={(mode === Mode.SCHEDULE ? 'active' : '') + ' right'}
      onClick={() => setMode(Mode.SCHEDULE)}>
      Schedule
    </button>
  </div>
);

const ModeSelectorWrapper = connect(
  state => ({
    mode: state.get('app').get('mode'),
  }),
  dispatch => ({
    setMode: mode => dispatch(actions.setMode(mode)),
  }),
)(ModeSelector);


export default ModeSelectorWrapper;
