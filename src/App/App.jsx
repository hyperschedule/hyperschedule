import React from 'react';

import ModeSelector from './ModeSelector/ModeSelector';
import Schedule from './Schedule/Schedule';
import CourseSearch from './CourseSearch/CourseSearch';
import CourseDescription from './CourseDescription/CourseDescription';
import SelectedCourses from './SelectedCourses/SelectedCourses';
import CreditCount from './CreditCount/CreditCount';
import Controls from './Controls/Controls';
import Popup from './Popup/Popup';

import './App.css';

function App() {
  return (
    <div id="app">
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
}

export default App;
