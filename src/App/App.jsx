import React from 'react';
import {connect} from 'react-redux';

import ModeSelector      from './ModeSelector/ModeSelector';
import Schedule          from './Schedule/Schedule';
import CourseSearch      from './CourseSearch/CourseSearch';
import CourseDescription from './CourseDescription/CourseDescription';
import SelectedCourses   from './SelectedCourses/SelectedCourses';
import CreditCount       from './CreditCount/CreditCount';
import Controls          from './Controls/Controls';
import Popup             from './Popup/Popup';

import {Mode} from '@/App/mode';

import './App.css';

const modeClass = {
  [Mode.COURSE_SEARCH]: 'course-search',
  [Mode.SCHEDULE]: 'schedule',
};

const App = ({mode}) => {

  return (
    <div id="app" className={'mode-' + modeClass[mode]}>
      <div className="columns">
        <div className="mode column">
          <div className="selector container">
            <ModeSelector/>
          </div>
          <div className="content container">
            <CourseSearch/>
            <Schedule/>
          </div>
        </div>
        <div className="sidebar column">
          <Controls/>
          <CourseDescription/>
          <SelectedCourses/>
          <CreditCount/>
        </div>
      </div>
      <Popup/>
    </div>
  );
};

export default connect(
  state => ({
    mode: state.get('mode'),
  }),
  dispatch => ({}),
)(App);
