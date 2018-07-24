import React from 'react';
import {connect} from 'react-redux';

import {Mode} from '../actions';

import CourseSearch from './CourseSearch/CourseSearch';
import Schedule from './Schedule/Schedule';

import './ModeContent.css';

const content = {
  [Mode.COURSE_SEARCH]: <CourseSearch/>,
  [Mode.SCHEDULE]: <Schedule/>,
};

const ModeContent = ({mode}) => (
  <div id="mode-content">
    {content[mode]}
  </div>
);

const ModeContentWrapper = connect(
  state => ({
    mode: state.get('app').get('mode'),
  }),
  dispatch => ({}),
)(ModeContent);


export default ModeContentWrapper;
