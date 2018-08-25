import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import * as actions from './actions';
import Mode from '@/App/mode';

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

ModeSelector.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
};

const ModeSelectorWrapper = connect(
  state => ({
    mode: state.get('mode'),
  }),
  dispatch => ({
    setMode: mode => dispatch(actions.setMode(mode)),
  }),
)(ModeSelector);

export default ModeSelectorWrapper;
