import React from 'react';

import ModeSelector from './ModeSelector/ModeSelector';
import ModeContent from './ModeContent/ModeContent';
import CourseDescription from './CourseDescription/CourseDescription';
import SelectedCourses from './SelectedCourses/SelectedCourses';


import './App.css';

const App = () => {
    return (
        <div className="columns">
          <div className="mode column">
            <div className="selector container">
              <ModeSelector/>
            </div>
            <div className="content container">
              <ModeContent/>
            </div>
          </div>
          <div className="sidebar column">
            <div id='controls'>
              <a href='https://github.com/MuddCreates/hyperschedule'
                 className='button github'
                 target='_blank'>
                Github
              </a>
              <button className='port-data'>Import/export data</button>
              <button className='print'>Print</button>
              <button className='help'>Help</button>
            </div>
            <CourseDescription/>
            <SelectedCourses/>
          </div>
        </div>
    );
};

export default App;
