import React from 'react';
import {Mode} from './actions';
import './ModeSelector.css';

const ModeSelector = ({mode, setMode}) => (
    <div id="mode-selector">
      <button
        className={mode == Mode.COURSE_SEARCH ? 'active' : ''}
        onClick={() => setMode(Mode.COURSE_SEARCH)}>
        Course Search
      </button>
      <button
        className={mode == Mode.SCHEDULE ? 'active' : ''}
        onClick={() => setMode(Mode.SCHEDULE)}>
        Schedule
      </button>
    </div>
);

export default ModeSelector;
