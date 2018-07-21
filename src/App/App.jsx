import React from 'react';

import ModeSelector from './ModeSelector/ModeSelector';
import ModeContent from './ModeContent/ModeContent';
import FocusSummary from './FocusSummary/FocusSummary';
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
            <FocusSummary/>
            <SelectedCourses/>
          </div>
        </div>
    );
};

export default App;
